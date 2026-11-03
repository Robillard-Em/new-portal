import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { orbitPolyline, scenePosition } from "../lib/orbit";
import type { SpaceObject } from "../types";

export interface ScenePair {
  id: string;
  primaryId: string;
  secondaryId: string;
}

interface SceneApi {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  markers: THREE.Group;
  orbits: THREE.Group;
  links: THREE.Group;
  earthMaterial: THREE.MeshStandardMaterial;
  markerGeometry: THREE.SphereGeometry;
  hitGeometry: THREE.SphereGeometry;
  meshById: Map<string, THREE.Object3D>;
  frame: (distance: number) => void;
}

const COLOR_TOKENS = {
  debris: "--nebula-component-satellite-red-icon",
  LEO: "--nebula-color-data-visualization-blue-medium",
  MEO: "--nebula-color-data-visualization-teal-medium",
  GEO: "--nebula-color-data-visualization-yellow-medium",
  HEO: "--nebula-color-data-visualization-purple-medium",
  selected: "--nebula-color-palette-yellow-300",
  link: "--nebula-color-data-visualization-orange-medium",
  equator: "--nebula-color-palette-neutral-400",
  land: "--nebula-color-palette-green-800",
  oceanDeep: "--nebula-color-palette-neutral-900",
  ocean: "--nebula-color-palette-blue-900",
  ice: "--nebula-color-palette-neutral-100",
} as const;

function readCssColor(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value || "#7ad";
}

function makeEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);
  const oceanDeep = readCssColor(COLOR_TOKENS.oceanDeep);
  const ocean = readCssColor(COLOR_TOKENS.ocean);
  const land = readCssColor(COLOR_TOKENS.land);
  const ice = readCssColor(COLOR_TOKENS.ice);
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, ocean);
  gradient.addColorStop(0.45, oceanDeep);
  gradient.addColorStop(1, ocean);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1024, 512);
  context.fillStyle = land;
  const blobs: [number, number, number, number][] = [
    [-100, 46, 58, 30],
    [-60, -16, 26, 36],
    [14, 50, 22, 14],
    [20, 4, 30, 36],
    [80, 46, 58, 24],
    [102, 18, 22, 16],
    [134, -24, 18, 12],
  ];
  for (const [lon, lat, rxDeg, ryDeg] of blobs) {
    const x = ((lon + 180) / 360) * 1024;
    const y = ((90 - lat) / 180) * 512;
    context.beginPath();
    context.ellipse(x, y, (rxDeg / 360) * 1024, (ryDeg / 180) * 512, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = ice;
  context.fillRect(0, 0, 1024, 26);
  context.fillRect(0, 486, 1024, 26);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export function OrbitScene({
  objects,
  selectedIds,
  pairs,
  timeScale,
  onSelect,
}: {
  objects: SpaceObject[];
  selectedIds: string[];
  pairs: ScenePair[];
  timeScale: number;
  onSelect: (id: string, toggle: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const objectsRef = useRef(objects);
  const selectedRef = useRef(new Set(selectedIds));
  const pairsRef = useRef(pairs);
  const timeScaleRef = useRef(timeScale);
  const onSelectRef = useRef(onSelect);
  const [webgl, setWebgl] = useState<"pending" | "ok" | "error">("pending");
  const [hoverName, setHoverName] = useState("");
  objectsRef.current = objects;
  selectedRef.current = new Set(selectedIds);
  pairsRef.current = pairs;
  timeScaleRef.current = timeScale;
  onSelectRef.current = onSelect;

  const idKey = objects.map((object) => object.id).join("|");
  const pairKey = pairs.map((pair) => pair.id).join("|");

  useEffect(() => {
    const surface = canvasRef.current;
    if (!surface) return;
    const canvas: HTMLCanvasElement = surface;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    } catch {
      setWebgl("error");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.02, 280);
    camera.position.set(6.4, 3.4, 6.4);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.maxDistance = 80;
    controls.minDistance = 1.35;

    const texture = makeEarthTexture();
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.92,
      metalness: 0.02,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), earthMaterial);
    scene.add(earth);
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.035, 48, 32),
      new THREE.MeshBasicMaterial({
        color: readCssColor("--nebula-color-palette-blue-400"),
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
      }),
    );
    scene.add(atmosphere);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(8, 3.2, 4);
    scene.add(sun);

    const stars = new THREE.BufferGeometry();
    const starPositions = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i += 1) {
      const radius = 70 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi);
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    stars.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    scene.add(
      new THREE.Points(
        stars,
        new THREE.PointsMaterial({
          color: readCssColor("--nebula-color-palette-neutral-100"),
          size: 0.12,
          sizeAttenuation: true,
        }),
      ),
    );

    const equatorPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i += 1) {
      const angle = (i / 128) * Math.PI * 2;
      equatorPoints.push(new THREE.Vector3(Math.cos(angle) * 1.012, 0, Math.sin(angle) * 1.012));
    }
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(equatorPoints),
        new THREE.LineBasicMaterial({ color: readCssColor(COLOR_TOKENS.equator), transparent: true, opacity: 0.45 }),
      ),
    );

    const markers = new THREE.Group();
    const orbits = new THREE.Group();
    const links = new THREE.Group();
    scene.add(markers, orbits, links);

    const api: SceneApi = {
      renderer,
      scene,
      camera,
      controls,
      markers,
      orbits,
      links,
      earthMaterial,
      markerGeometry: new THREE.SphereGeometry(1, 14, 12),
      hitGeometry: new THREE.SphereGeometry(1, 10, 8),
      meshById: new Map(),
      frame(distance: number) {
        const direction = camera.position.clone();
        if (direction.lengthSq() < 1e-6) direction.set(1, 0.55, 1);
        direction.normalize().multiplyScalar(distance);
        camera.position.copy(direction);
        controls.target.set(0, 0, 0);
        controls.update();
      },
    };
    apiRef.current = api;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown: { x: number; y: number } | null = null;
    const hover = { id: "" };

    function resize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function pick(event: PointerEvent): string {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markers.children, true);
      for (const hit of hits) {
        let node: THREE.Object3D | null = hit.object;
        while (node) {
          if (typeof node.userData.id === "string") return node.userData.id;
          node = node.parent;
        }
      }
      return "";
    }

    function onPointerDown(event: PointerEvent) {
      pointerDown = { x: event.clientX, y: event.clientY };
    }
    function onPointerUp(event: PointerEvent) {
      if (!pointerDown) return;
      const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
      pointerDown = null;
      if (moved > 5) return;
      const id = pick(event);
      if (!id) return;
      onSelectRef.current(id, event.shiftKey || event.metaKey || event.ctrlKey);
    }
    function onPointerMove(event: PointerEvent) {
      hover.id = pick(event);
      canvas.style.cursor = hover.id ? "pointer" : "grab";
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const started = performance.now();
    let frameId = 0;
    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const simMs = (performance.now() - started) * timeScaleRef.current * 1000;
      const selected = selectedRef.current;
      for (const child of markers.children) {
        const object = child.userData.object as SpaceObject | undefined;
        if (!object) continue;
        const point = scenePosition(object, simMs);
        child.position.set(point.x, point.y, point.z);
        const isSelected = selected.has(object.id);
        const distance = camera.position.distanceTo(child.position);
        const base = Math.min(0.11, Math.max(0.028, distance * 0.0065));
        child.scale.setScalar(isSelected ? base * 1.6 : base);
        const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = isSelected ? 0.85 : 0.28;
      }
      for (const child of orbits.children) {
        const material = (child as THREE.Line).material as THREE.LineBasicMaterial;
        const id = child.userData.id as string;
        material.opacity = selected.has(id) ? 0.95 : 0.2;
      }
      for (const child of links.children) {
        const from = api.meshById.get(child.userData.primaryId as string);
        const to = api.meshById.get(child.userData.secondaryId as string);
        const attribute = (child as THREE.Line).geometry.getAttribute("position") as THREE.BufferAttribute;
        if (!from || !to) continue;
        attribute.setXYZ(0, from.position.x, from.position.y, from.position.z);
        attribute.setXYZ(1, to.position.x, to.position.y, to.position.z);
        attribute.needsUpdate = true;
      }
      const daySeconds = simMs / 1000;
      earth.rotation.y = (daySeconds / 86164) * Math.PI * 2;
      renderer.setClearColor(getComputedStyle(document.body).backgroundColor);
      controls.update();
      renderer.render(scene, camera);

      const label = labelRef.current;
      if (label) {
        const mesh = hover.id ? api.meshById.get(hover.id) : undefined;
        if (!mesh) {
          label.hidden = true;
        } else {
          const projected = mesh.position.clone().project(camera);
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          label.hidden = projected.z < -1 || projected.z > 1;
          label.style.left = `${(projected.x * 0.5 + 0.5) * width}px`;
          label.style.top = `${(-projected.y * 0.5 + 0.5) * height}px`;
          const name = (mesh.userData.object as SpaceObject).name;
          if (label.textContent !== name) {
            label.textContent = name;
            setHoverName(name);
          }
        }
      }
    };
    tick();
    setWebgl("ok");

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      apiRef.current = null;
      controls.dispose();
      earth.geometry.dispose();
      atmosphere.geometry.dispose();
      earthMaterial.dispose();
      texture.dispose();
      stars.dispose();
      api.markerGeometry.dispose();
      api.hitGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const colorCache = new Map<string, THREE.Color>();
    const colorFor = (token: string) => {
      let color = colorCache.get(token);
      if (!color) {
        color = new THREE.Color(readCssColor(token));
        colorCache.set(token, color);
      }
      return color;
    };

    for (const child of [...api.markers.children]) {
      const mesh = child as THREE.Mesh;
      (mesh.material as THREE.Material).dispose();
      api.markers.remove(mesh);
    }
    for (const child of [...api.orbits.children]) {
      const line = child as THREE.Line;
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
      api.orbits.remove(line);
    }
    api.meshById.clear();

    for (const object of objectsRef.current) {
      const token = object.kind === "debris" ? COLOR_TOKENS.debris : COLOR_TOKENS[object.regime];
      const color = colorFor(token);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.28,
        roughness: 0.35,
      });
      const mesh = new THREE.Mesh(api.markerGeometry, material);
      mesh.userData.id = object.id;
      mesh.userData.object = object;
      const hit = new THREE.Mesh(
        api.hitGeometry,
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hit.scale.setScalar(4.2);
      hit.userData.id = object.id;
      mesh.add(hit);
      api.markers.add(mesh);
      api.meshById.set(object.id, mesh);

      const points = orbitPolyline(object).map((point) => new THREE.Vector3(point.x, point.y, point.z));
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 }),
      );
      line.userData.id = object.id;
      api.orbits.add(line);
    }

    const themeObserver = new MutationObserver(() => {
      api.earthMaterial.map = makeEarthTexture();
      api.earthMaterial.map.needsUpdate = true;
      api.earthMaterial.needsUpdate = true;
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-color-scheme"],
    });
    return () => {
      themeObserver.disconnect();
    };
  }, [idKey, webgl]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    for (const child of [...api.links.children]) {
      const line = child as THREE.Line;
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
      api.links.remove(line);
    }
    const color = new THREE.Color(readCssColor(COLOR_TOKENS.link));
    for (const pair of pairsRef.current) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }),
      );
      line.userData.primaryId = pair.primaryId;
      line.userData.secondaryId = pair.secondaryId;
      api.links.add(line);
    }
  }, [pairKey, webgl]);

  function frame(distance: number) {
    apiRef.current?.frame(distance);
  }

  return (
    <div className="viz-stage" data-testid="viz-canvas" data-webgl={webgl} data-hover={hoverName}>
      <canvas ref={canvasRef} aria-label="Earth and catalog orbits. Drag to rotate, scroll to zoom, click an object to select it." />
      <div ref={labelRef} className="viz-label" hidden />
      <div className="viz-toolbar">
        <button type="button" className="button button-secondary button--small" onClick={() => frame(2.5)}>
          LEO
        </button>
        <button type="button" className="button button-secondary button--small" onClick={() => frame(8)}>
          MEO
        </button>
        <button type="button" className="button button-secondary button--small" onClick={() => frame(14)}>
          GEO
        </button>
        <button type="button" className="button button-secondary button--small" onClick={() => frame(32)}>
          HEO
        </button>
      </div>
      {webgl === "error" ? (
        <p className="viz-fallback" role="alert">
          WebGL is unavailable. Use the object list to select catalog entries.
        </p>
      ) : null}
    </div>
  );
}
