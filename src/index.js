import ReactDOM from "react-dom/client";
import App from "./App";
import Acquisition from "./apps/Acquisition";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
]);

root.render(<RouterProvider router={router} />);
