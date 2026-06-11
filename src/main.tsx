import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
// import "@github/spark/spark" // Disabled for local development

import App from "./App.tsx";
import { ErrorFallback } from "./ErrorFallback.tsx";

import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/700.css";
import "./index.css";
import "./main.css";
import "./styles/theme.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>,
);
