import React from 'react'
import ReactDOM from 'react-dom/client'
import {NextUIProvider} from "@nextui-org/system";
import App from "./app";
import '@/styles/globals.css';
import '@/styles/globals-v2.scss';
import '@/styles/index.module.scss';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
      <NextUIProvider>
        <App/>
      </NextUIProvider>
  </React.StrictMode>,
)
