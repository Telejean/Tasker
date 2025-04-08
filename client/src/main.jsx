import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "@radix-ui/themes/styles.css";
import { BrowserRouter } from "react-router";
import App from './App.jsx'
import { Theme } from "@radix-ui/themes";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Theme>
        <App />
      </Theme>
    </BrowserRouter>
  </StrictMode>,
)
