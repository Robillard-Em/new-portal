import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { usePortal } from "../state/PortalState";

const APPS = [
  { to: "/", label: "Catalog", end: true, testId: "nav-catalog", icon: CatalogIcon },
  { to: "/visualize", label: "3D view", end: false, testId: "nav-visualize", icon: OrbitIcon },
  { to: "/query", label: "Query", end: false, testId: "nav-query", icon: QueryIcon },
  { to: "/conjunctions", label: "Conjunctions", end: false, testId: "nav-conjunctions", icon: ConjunctionIcon },
  { to: "/analytics", label: "Analytics", end: false, testId: "nav-analytics", icon: AnalyticsIcon },
] as const;

export function AppShell() {
  const { selection } = usePortal();
  const location = useLocation();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.dataset.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const current = APPS.find((app) => (app.end ? location.pathname === app.to : location.pathname.startsWith(app.to)));
    document.title = current ? `${current.label} · New Portal` : "New Portal";
  }, [location.pathname]);

  function closePopover(id: string) {
    document.getElementById(id)?.hidePopover();
  }

  const selectionLabel = selection.length === 0 ? "None selected" : `${selection.length} selected`;

  return (
    <div className="app-shell">
      <header className="app-bar">
        <div className="app-bar__start">
          <button
            type="button"
            className="icon-button app-switcher-button"
            popoverTarget="app-switcher"
            aria-label="Applications"
          >
            <SwitcherIcon />
          </button>
          <span className="app-bar-logo" aria-hidden="true">
            <LogoMark />
          </span>
        </div>
        <div className="app-bar__center app-bar-title-block">
          <p className="app-bar-title">New Portal</p>
          <p className="app-bar-description">Space domain</p>
        </div>
        <div className="app-bar__end">
          <NavLink
            to="/analytics"
            className="button button-tertiary button--small app-bar-selection"
            data-testid="selection-count"
            aria-label={selectionLabel}
          >
            <span className="app-bar-selection__full">{selectionLabel}</span>
            <span className="app-bar-selection__short" data-count={selection.length} aria-hidden="true" />
          </NavLink>
          <button
            type="button"
            className="icon-button settings-button"
            popoverTarget="settings-menu"
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      <div
        id="app-switcher"
        popover="auto"
        className="anchored-popover chrome-popover app-switcher-popup"
      >
        <div className="app-switcher-grid">
          {APPS.map((app) => (
            <NavLink
              key={app.to}
              to={app.to}
              end={app.end}
              className="app-item"
              onClick={() => closePopover("app-switcher")}
            >
              <span className="app-icon" aria-hidden="true">
                <app.icon />
              </span>
              {app.label}
            </NavLink>
          ))}
        </div>
        <div className="app-switcher-footer">
          <p className="app-bar-description">One catalog shared across every view</p>
        </div>
      </div>

      <div id="settings-menu" popover="auto" className="anchored-popover chrome-popover settings-menu-dropdown">
        <div className="settings-menu-item">
          <span className="settings-menu-item-text">Dark theme</span>
          <span className="settings-menu-switch-container">
            <input
              className="settings-menu-switch-input"
              type="checkbox"
              role="switch"
              data-testid="theme-switch"
              checked={theme === "dark"}
              aria-checked={theme === "dark"}
              onChange={(event) => setTheme(event.target.checked ? "dark" : "light")}
            />
          </span>
        </div>
        <div className="settings-menu-divider" />
        <p className="settings-note">Dark is the default. Light mode uses the same Nebula semantic tokens.</p>
      </div>

      <nav className="portal-nav" aria-label="Applications">
        {APPS.map((app) => (
          <NavLink key={app.to} to={app.to} end={app.end} className="portal-nav-link" data-testid={app.testId}>
            {app.label}
          </NavLink>
        ))}
      </nav>
      <main className="workspace">
        <Outlet />
      </main>
    </div>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 30 25" aria-hidden="true">
      <circle cx="15" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="15" cy="13" rx="12" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="11" r="1.6" fill="currentColor" />
    </svg>
  );
}

function SwitcherIcon() {
  return (
    <svg className="icon icon-app-switcher" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="icon icon-settings" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5zm8.2 2.6-1.7-.3a6.8 6.8 0 0 0-.7-1.6l1-1.4-1.6-1.6-1.4 1a6.8 6.8 0 0 0-1.6-.7l-.3-1.7h-2.2l-.3 1.7a6.8 6.8 0 0 0-1.6.7l-1.4-1-1.6 1.6 1 1.4c-.3.5-.5 1-.7 1.6l-1.7.3v2.2l1.7.3c.2.6.4 1.1.7 1.6l-1 1.4 1.6 1.6 1.4-1c.5.3 1 .5 1.6.7l.3 1.7h2.2l.3-1.7c.6-.2 1.1-.4 1.6-.7l1.4 1 1.6-1.6-1-1.4c.3-.5.5-1 .7-1.6l1.7-.3z" />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path fill="currentColor" d="M5 4h10l4 4v12H5zM14 4v5h5" />
    </svg>
  );
}

function OrbitIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function QueryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path fill="currentColor" d="M4 6h16v2H4zm2 5h12v2H6zm3 5h6v2H9z" />
    </svg>
  );
}

function ConjunctionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <circle cx="8" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path fill="currentColor" d="M4 19h16v2H4zm2-4h3v3H6zm5-6h3v9h-3zm5-4h3v13h-3z" />
    </svg>
  );
}
