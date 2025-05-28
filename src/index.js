// index.js
import ReactDOM from "react-dom/client";
import App from "./App";
import Acquisition from "./apps/Acquisition";
import Dashboard from "./apps/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "acquisition", element: <Acquisition /> },
      { path: "records", element: <div style={{ padding: '2rem' }}><h1>Records Page</h1><p>Coming soon...</p></div> },
      { path: "settings", element: <div style={{ padding: '2rem' }}><h1>Settings</h1><p>Configure your preferences.</p></div> },
      { path: "help", element: <div style={{ padding: '2rem' }}><h1>Help</h1><p>Need assistance? You're in the right place.</p></div> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
