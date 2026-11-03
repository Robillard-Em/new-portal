import { Navigate, Route, Routes } from "react-router-dom";
import { AnalyticsView } from "./components/AnalyticsView";
import { AppShell } from "./components/AppShell";
import { CatalogView } from "./components/CatalogView";
import { ConjunctionsView } from "./components/ConjunctionsView";
import { QueryBuilderView } from "./components/QueryBuilderView";
import { VisualizationView } from "./components/VisualizationView";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<CatalogView />} />
        <Route path="catalog" element={<Navigate to="/" replace />} />
        <Route path="visualize" element={<VisualizationView />} />
        <Route path="query" element={<QueryBuilderView />} />
        <Route path="conjunctions" element={<ConjunctionsView />} />
        <Route path="analytics" element={<AnalyticsView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
