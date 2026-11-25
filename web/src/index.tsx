import React from "react";
import ReactDOM from "react-dom/client";
import { installPreloadErrorReload } from "./preloadError";
import { registerServiceWorker } from "./registerServiceWorker";

import "./shell/braun.scss";
import "./ui/tailwind.css";

import App from "./App";

installPreloadErrorReload();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

window.addEventListener("load", () => {
  registerServiceWorker();
});
