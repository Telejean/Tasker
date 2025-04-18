import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@radix-ui/themes/styles.css";
import './index.css'
import { BrowserRouter } from "react-router";
import App from './App.js'
import { Theme, ThemePanel } from "@radix-ui/themes";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Theme
        accentColor='cyan'
        panelBackground="solid"
      >
        <App />
        {/* <ThemePanel /> */}
      </Theme>
    </BrowserRouter>
  </StrictMode>,
)
