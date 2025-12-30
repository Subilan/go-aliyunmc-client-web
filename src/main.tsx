import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/300-italic.css';
import '@fontsource/lato/400-italic.css';
import '@fontsource/lato/700-italic.css';

import "./index.css"
import Root from "./root.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)