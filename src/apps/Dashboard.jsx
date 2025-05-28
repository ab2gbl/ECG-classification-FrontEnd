// src/apps/Dashboard.jsx
import React from "react";
import "./Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const pieData = [
  { name: "Normal", value: 72 },
  { name: "Abnormal", value: 28 },
];

const COLORS = ["#00c2ff", "#9e00ff"];

const lineData = [
  { month: "Jan", examined: 2 },
  { month: "Feb", examined: 4 },
  { month: "Mar", examined: 6 },
  { month: "Apr", examined: 5 },
  { month: "May", examined: 3 },
  { month: "Jun", examined: 4.5 },
  { month: "Jul", examined: 3.2 },
  { month: "Aug", examined: 2.8 },
];

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">📊 Dashboard</h1>
        <p className="dashboard-description">
          AI-powered signal segmentation, feature extraction, and diagnosis of cardiac abnormalities
        </p>
      </div>

      <div className="cards">
        <div className="card green">
          <h2>Total Patients</h2>
          <p className="big-number">61,923</p>
          <p>Total number of patients</p>
        </div>
        <div className="card blue">
          <h2>Average cost</h2>
          <p className="big-number">$30.0</p>
          <p>Average cost per patient</p>
        </div>
      </div>

      <div className="overview-section">
        <h2>Overview</h2>
        <p>Patients examined by month</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" />
            <Line
              type="monotone"
              dataKey="examined"
              stroke="#007cf0"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bottom-cards">
        <div className="card outcomes">
          <h2>Examination Outcomes</h2>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={45}
                outerRadius={60}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            <p><span className="dot" style={{ backgroundColor: COLORS[0] }}></span> 72% Normal</p>
            <p><span className="dot" style={{ backgroundColor: COLORS[1] }}></span> 28% Abnormal</p>
          </div>
        </div>

        <div className="card diagnoses">
          <h2>Latest Diagnoses</h2>
          <p className="big-number">IDKIDKIDK</p>
          <p>dfopsdofso</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
