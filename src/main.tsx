import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import "./i18n.ts";
import { Suspense } from "react";

createRoot(document.getElementById("root")!).render(
  <Suspense fallback="loading...">
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </Suspense>
);
