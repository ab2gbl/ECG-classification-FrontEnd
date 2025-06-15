// src/apps/Dashboard.jsx
import React from "react";
import "./Dashboard.css";
import SignalFeaturesViewer from "../components/SignalFeaturesViewer";
import SignalsTable from "../components/SignalsTable";
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
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#00c2ff",
  "#9e00ff",
  "#ff6b6b",
  "#4ecdc4",
  "#ffd93d",
  "#6c5ce7",
];

function Dashboard() {
  // Mock data for demonstration - in real app, this would come from your backend
  const beatDistribution = [
    { name: "Normal (N)", value: 72 },
    { name: "LBBB (L)", value: 8 },
    { name: "RBBB (R)", value: 6 },
    { name: "PVC (V)", value: 10 },
    { name: "Paced (/)", value: 2 },
    { name: "Other", value: 2 },
  ];

  const heartRateData = [
    { time: "00:00", rate: 72 },
    { time: "00:05", rate: 75 },
    { time: "00:10", rate: 68 },
    { time: "00:15", rate: 70 },
    { time: "00:20", rate: 73 },
    { time: "00:25", rate: 71 },
    { time: "00:30", rate: 69 },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">📊 ECG Analysis Dashboard</h1>
        <p className="dashboard-description">
          Real-time monitoring and analysis of ECG signals, beat classification,
          and cardiac abnormalities detection
        </p>
      </div>

      <div className="cards">
        <div className="card green">
          <h2>Average Heart Rate</h2>
          <p className="big-number">72 BPM</p>
          <p>Last 30 minutes</p>
        </div>
        <div className="card blue">
          <h2>Signal Quality</h2>
          <p className="big-number">98%</p>
          <p>Signal quality index</p>
        </div>
        <div className="card purple">
          <h2>Total Beats</h2>
          <p className="big-number">1,234</p>
          <p>Analyzed beats</p>
        </div>
      </div>

      <div className="overview-section">
        <h2>Heart Rate Trend</h2>
        <p>Last 30 minutes</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={heartRateData}>
            <XAxis dataKey="time" />
            <YAxis domain={[60, 100]} />
            <Tooltip />
            <CartesianGrid stroke="#eee" />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#007cf0"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bottom-cards">
        <div className="card outcomes">
          <h2>Beat Type Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={beatDistribution}
                innerRadius={45}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {beatDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card diagnoses">
          <h2>Key ECG Features</h2>
          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-label">QRS Duration</span>
              <span className="feature-value">85ms</span>
            </div>
            <div className="feature-item">
              <span className="feature-label">PR Interval</span>
              <span className="feature-value">160ms</span>
            </div>
            <div className="feature-item">
              <span className="feature-label">QT Interval</span>
              <span className="feature-value">420ms</span>
            </div>
            <div className="feature-item">
              <span className="feature-label">ST Segment</span>
              <span className="feature-value">Normal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="signals-table-section">
        <SignalsTable />
      </div>
    </div>
  );
}

export default Dashboard;
