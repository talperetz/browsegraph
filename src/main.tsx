import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {NextUIProvider} from "@nextui-org/system";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NextUIProvider>
        <div></div>
      </NextUIProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
