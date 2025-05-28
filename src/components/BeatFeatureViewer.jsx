import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import "./BeatFeatureViewer.css";

const BeatFeatureViewer = ({
  signal,
  mask,
  beatFeatures,
  fs,
  windowStart = 0,
}) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    console.log("BeatFeatureViewer props:", {
      signalLength: signal?.length,
      maskLength: mask?.length,
      beatFeatures,
      fs,
      windowStart,
    });

    if (!signal || !mask) return;

    // Get the window of data for this beat
    //const start = parseInt(beatFeatures.start) - windowStart;
    const start = parseInt(beatFeatures.start);
    const end = parseInt(beatFeatures.end);
    const beatSignal = signal.slice(start, end);
    const beatMask = mask.slice(start, end);

    console.log("Beat window:", {
      start,
      end,
      beatSignalLength: beatSignal.length,
    });

    // Convert signal to chart data format
    const data = beatSignal.map((value, index) => ({
      time: (start + index) / fs,
      value,
      pWave: beatMask[index] === 1 ? value : null,
      qrsComplex: beatMask[index] === 2 ? value : null,
      tWave: beatMask[index] === 3 ? value : null,
    }));

    console.log("Chart data sample:", data.slice(0, 5));
    setChartData(data);
  }, [signal, mask, fs, beatFeatures, windowStart]);

  const renderAnnotations = () => {
    const annotations = [];
    const start = parseInt(beatFeatures.start) - windowStart;

    // Add P peak
    if (beatFeatures?.P_index) {
      const pIdx = parseInt(beatFeatures.P_index) - windowStart - start;
      if (pIdx >= 0 && pIdx < chartData.length) {
        annotations.push(
          <ReferenceLine
            key="p-peak"
            x={chartData[pIdx]?.time}
            stroke="blue"
            label={{
              value: `P Peak\n${chartData[pIdx]?.value.toFixed(2)}`,
              position: "top",
              fill: "blue",
            }}
          />
        );
      }
    }

    // Add Q peak
    if (beatFeatures?.Q_index) {
      const qIdx = parseInt(beatFeatures.Q_index) - windowStart - start;
      if (qIdx >= 0 && qIdx < chartData.length) {
        annotations.push(
          <ReferenceLine
            key="q-peak"
            x={chartData[qIdx]?.time}
            stroke="magenta"
            label={{
              value: `Q Peak\n${chartData[qIdx]?.value.toFixed(2)}`,
              position: "top",
              fill: "magenta",
            }}
          />
        );
      }
    }

    // Add R peak
    if (beatFeatures?.R_index) {
      const rIdx = parseInt(beatFeatures.R_index) - windowStart - start;
      if (rIdx >= 0 && rIdx < chartData.length) {
        annotations.push(
          <ReferenceLine
            key="r-peak"
            x={chartData[rIdx]?.time}
            stroke="red"
            label={{
              value: `R Peak\n${chartData[rIdx]?.value.toFixed(2)}`,
              position: "top",
              fill: "red",
            }}
          />
        );
      }
    }

    // Add S peak
    if (beatFeatures?.S_index) {
      const sIdx = parseInt(beatFeatures.S_index) - windowStart - start;
      if (sIdx >= 0 && sIdx < chartData.length) {
        annotations.push(
          <ReferenceLine
            key="s-peak"
            x={chartData[sIdx]?.time}
            stroke="cyan"
            label={{
              value: `S Peak\n${chartData[sIdx]?.value.toFixed(2)}`,
              position: "top",
              fill: "cyan",
            }}
          />
        );
      }
    }

    // Add T peak
    if (beatFeatures?.T_index) {
      const tIdx = parseInt(beatFeatures.T_index) - windowStart - start;
      if (tIdx >= 0 && tIdx < chartData.length) {
        annotations.push(
          <ReferenceLine
            key="t-peak"
            x={chartData[tIdx]?.time}
            stroke="green"
            label={{
              value: `T Peak\n${chartData[tIdx]?.value.toFixed(2)}`,
              position: "top",
              fill: "green",
            }}
          />
        );
      }
    }

    return annotations;
  };

  if (!signal || !mask || !beatFeatures) {
    return <div>No data available</div>;
  }

  return (
    <div className="beat-feature-viewer">
      <h3>Beat Features Visualization</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: "Time (s)", position: "bottom" }}
            />
            <YAxis
              label={{ value: "Amplitude", angle: -90, position: "left" }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="black"
              dot={false}
              name="ECG Signal"
            />
            <Line
              type="monotone"
              dataKey="pWave"
              stroke="blue"
              dot={false}
              name="P Wave"
            />
            <Line
              type="monotone"
              dataKey="qrsComplex"
              stroke="red"
              dot={false}
              name="QRS Complex"
            />
            <Line
              type="monotone"
              dataKey="tWave"
              stroke="green"
              dot={false}
              name="T Wave"
            />
            {renderAnnotations()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BeatFeatureViewer;
