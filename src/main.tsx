import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
// import "@github/spark/spark" // Disabled for local development

import App from "./App.tsx";
import { ErrorFallback } from "./ErrorFallback.tsx";

import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-700.css";
import "./index.css";
import "./main.css";
import "./styles/theme.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>,
);
