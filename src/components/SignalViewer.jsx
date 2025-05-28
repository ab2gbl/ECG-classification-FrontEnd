import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
} from "chart.js";
import "./SignalViewer.css";
import FeatureTable from "./FeatureTable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip
);

function SignalViewer({
  signal,
  masks,
  startIndex,
  setStartIndex,
  fs = 250,
  features,
}) {
  const windowSize = 1000;
  const visibleSignal = signal.slice(startIndex, startIndex + windowSize);
  const visibleMasks = masks
    ? masks.slice(startIndex, startIndex + windowSize)
    : [];

  const chartLabels = visibleSignal.map((_, i) =>
    ((startIndex + i) / fs).toFixed(2)
  );
  const tooltipText = { 1: "P Wave", 2: "QRS Complex", 3: "T Wave" };

  const createMaskDataset = (maskValue, color, label) => {
    return {
      label,
      data: visibleMasks.map((m) => (m === maskValue ? 10 : null)),
      fill: {
        target: { value: -10 },
        above: color,
      },
      backgroundColor: color,
      borderWidth: 0,
      pointRadius: 0,
      tension: 0.1,
    };
  };

  const chartData = {
    labels: chartLabels,
    datasets: [
      createMaskDataset(1, "rgba(0, 0, 255, 0.25)", "P Wave"),
      createMaskDataset(2, "rgba(255, 0, 0, 0.25)", "QRS Complex"),
      createMaskDataset(3, "rgba(0, 255, 0, 0.25)", "T Wave"),
      {
        label: "Normalized ECG Signal",
        data: visibleSignal,
        borderColor: "#00bcd4",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="signal-viewer-wrapper">
      <div className="signal-chart-header">
        <div>
          <h2 className="signal-chart-title">📉 ECG Signal Chart</h2>
          <p className="signal-chart-desc">
            Time window: {(startIndex / fs).toFixed(2)}s –{" "}
            {((startIndex + windowSize) / fs).toFixed(2)}s
          </p>
        </div>

        <div className="wave-legend">
          <span className="hoverable-legend">
            <span className="dot blue" /> P wave
          </span>
          <span className="hoverable-legend">
            <span className="dot red" /> QRS
          </span>
          <span className="hoverable-legend">
            <span className="dot green" /> T wave
          </span>
        </div>
      </div>

      <input
        className="signal-slider"
        type="range"
        min={0}
        max={signal.length - windowSize}
        value={startIndex}
        step={50}
        onChange={(e) => setStartIndex(Number(e.target.value))}
      />

      <div className="signal-chart-container">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "nearest",
              axis: "x",
              intersect: false,
            },
            scales: {
              y: {
                min: -10,
                max: 10,
                title: {
                  display: true,
                  text: "Amplitude",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Time (s)",
                },
              },
            },
            plugins: {
              tooltip: {
                enabled: true,
                displayColors: false,
                callbacks: {
                  label: (ctx) => {
                    if (ctx.dataset.label !== "Normalized ECG Signal")
                      return null;
                    const i = ctx.dataIndex;
                    const maskVal = visibleMasks[i];
                    const name = tooltipText[maskVal];
                    const value = ctx.formattedValue;
                    return name ? `${name} at ${value}` : `Amplitude: ${value}`;
                  },
                },
              },
              legend: {
                display: false,
              },
            },
          }}
        />
      </div>

      {/*features && (
        <FeatureTable
          features={features}
          signal={signal}
          mask={masks}
          fs={fs}
        />
      )*/}
    </div>
  );
}

export default SignalViewer;
