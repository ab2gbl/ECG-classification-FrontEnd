import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./HeartRatePlot.css";

function HeartRatePlot({ features, fs = 250 }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!features || features.length === 0) return;

    // Calculate RR intervals and heart rate
    const rIndices = features
      .map((feature) => feature.R_index)
      .filter((index) => index !== undefined);
    const rrIntervals = [];
    const heartRates = [];
    const times = [];

    for (let i = 1; i < rIndices.length; i++) {
      const rrInterval = (rIndices[i] - rIndices[i - 1]) / fs; // in seconds
      const heartRate = 60 / rrInterval; // in bpm
      const time = rIndices[i] / fs; // in seconds

      rrIntervals.push(rrInterval);
      heartRates.push(heartRate);
      times.push(time);
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: times,
        datasets: [
          {
            label: "Heart Rate (bpm)",
            data: heartRates,
            borderColor: "#9c27b0", // Purple color
            backgroundColor: "rgba(156, 39, 176, 0.1)",
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#9c27b0",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Heart Rate Over Time",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                return `Heart Rate: ${context.parsed.y.toFixed(1)} bpm`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Time (s)",
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Heart Rate (bpm)",
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            min: Math.max(0, Math.min(...heartRates) - 10),
            max: Math.max(...heartRates) + 10,
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [features, fs]);

  return (
    <div className="heart-rate-plot-container">
      <div className="heart-rate-plot-wrapper">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

export default HeartRatePlot;
