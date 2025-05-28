// src/App.js
import React from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet /> {/* Render nested pages like Acquisition or Dashboard */}
      </main>
    </div>
  );
}

export default App;
