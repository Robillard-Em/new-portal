# New Portal

Space-domain workspace. Five views share one catalog, the current selection, and the active query:

- **Catalog** (`/`) — search and filter satellites and debris
- **3D view** (`/visualize`) — Earth and the same orbits
- **Query** (`/query`) — structured filters against the catalog
- **Conjunctions** (`/conjunctions`) — close approaches, miss distance, time of closest approach, and a plan (monitor, maneuver, cleared)
- **Analytics** (`/analytics`) — stats for one object, a comparison of several, or an empty selection

Sample data lives in the client. There is no backend.

The visual language is the Nebula token set copied into `src/styles/` (`nebula-design-tokens-light-dark.css` and `styles.css`). Dark is the default. Settings → Dark theme turns light mode on; semantic colors still come from the `light-dark()` tokens.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173.

Production build:

```bash
npm run build
npm run preview
```

## Fonts

Montserrat (SIL Open Font License) supplies `--nebula-font-family`. Inter and JetBrains Mono sit next to the copied stylesheet, which already references those files. License texts are in `src/styles/fonts/licenses/` and `src/styles/vendor/fonts/`.
