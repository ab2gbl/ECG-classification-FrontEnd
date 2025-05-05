import ReactDOM from "react-dom/client";
import App from "./App";
import Acquisition from "./apps/Acquisition";
import FeaturesExtraction from "./apps/FeaturesExtraction";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ECGWebSocket from "./apps/EcgWebsockets";
const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "acquisition/",
    element: <Acquisition />,
  },

  {
    path: "features/",
    element: <FeaturesExtraction />,
  },
  {
    path: "websocket/",
    element: <ECGWebSocket />,
  },
]);

root.render(<RouterProvider router={router} />);
