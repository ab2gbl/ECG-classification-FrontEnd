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
  ReferenceArea,
  Customized,
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
  const [beatMask, setBeatMask] = useState([]);
  const [yDomain, setYDomain] = useState(["auto", "auto"]);
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
    setBeatMask(beatMask);

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
    if (!chartData.length) return;

    const values = chartData.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    let enforcedMin = minVal;
    let enforcedMax = maxVal;

    if (maxVal - minVal < 10) {
      const midpoint = (minVal + maxVal) / 2;
      enforcedMin = midpoint - 5;
      enforcedMax = midpoint + 5;
    }

    setYDomain([enforcedMin, enforcedMax]);
  }, [signal, mask, fs, beatFeatures, windowStart, chartData]);
  const renderBackgroundMasks = () => {
    const areas = [];
    let currentType = null;
    let areaStart = null;

    chartData.forEach((point, index) => {
      const type = beatMask[index]; // 1: P, 2: QRS, 3: T

      if (type !== currentType) {
        if (currentType !== null && areaStart !== null) {
          areas.push({
            type: currentType,
            start: areaStart,
            end: chartData[index - 1]?.time,
          });
        }
        currentType = type;
        areaStart = type ? point.time : null;
      }
    });

    // Push the final area
    if (currentType !== null && areaStart !== null) {
      areas.push({
        type: currentType,
        start: areaStart,
        end: chartData[chartData.length - 1]?.time,
      });
    }

    return areas.map((area, i) => (
      <ReferenceArea
        key={`mask-${i}`}
        x1={area.start}
        x2={area.end}
        strokeOpacity={0}
        fill={
          area.type === 1
            ? "rgba(0, 0, 255, 0.1)"
            : area.type === 2
            ? "rgba(255, 0, 0, 0.1)"
            : "rgba(0, 128, 0, 0.1)"
        }
      />
    ));
  };
  const renderIntervals = () => {
    const start = parseInt(beatFeatures.start);

    const pIndices = chartData
      .map((d, i) => (mask[start + i] === 1 ? i : null))
      .filter((i) => i !== null);
    const qrsIndices = chartData
      .map((d, i) => (mask[start + i] === 2 ? i : null))
      .filter((i) => i !== null);
    const tIndices = chartData
      .map((d, i) => (mask[start + i] === 3 ? i : null))
      .filter((i) => i !== null);

    if (chartData.length === 0) return null;

    // Pick a baseline y position slightly below the signal
    const signalMin = Math.min(...chartData.map((d) => d.value));
    const yBase = signalMin - 0.5;

    return (
      <Customized
        component={({ xAxisMap, yAxisMap }) => {
          const xScale = Object.values(xAxisMap)[0]?.scale;
          const yScale = Object.values(yAxisMap)[0]?.scale;

          if (!xScale || !yScale) return null;

          const lines = [];

          // PR Interval: P start to QRS start
          if (pIndices.length > 0 && qrsIndices.length > 0) {
            lines.push(
              <line
                key="pr-interval"
                x1={xScale(chartData[pIndices[0]].time)}
                x2={xScale(chartData[qrsIndices[0]].time)}
                y1={yScale(yBase)}
                y2={yScale(yBase)}
                stroke="purple"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            );
          }

          // QT Interval: QRS start to T end
          if (qrsIndices.length > 0 && tIndices.length > 0) {
            lines.push(
              <line
                key="qt-interval"
                x1={xScale(chartData[qrsIndices[0]].time)}
                x2={xScale(chartData[tIndices[tIndices.length - 1]].time)}
                y1={yScale(yBase - 0.2)}
                y2={yScale(yBase - 0.2)}
                stroke="orange"
                strokeDasharray="3 3"
                strokeWidth={2}
              />
            );
          }

          // ST Interval: QRS end to T start
          if (qrsIndices.length > 0 && tIndices.length > 0) {
            lines.push(
              <line
                key="st-interval"
                x1={xScale(chartData[qrsIndices[qrsIndices.length - 1]].time)}
                x2={xScale(chartData[tIndices[0]].time)}
                y1={yScale(yBase - 0.4)}
                y2={yScale(yBase - 0.4)}
                stroke="green"
                strokeDasharray="6 2"
                strokeWidth={2}
              />
            );
          }

          return <g>{lines}</g>;
        }}
      />
    );
  };

  const renderAnnotations = () => {
    const start = parseInt(beatFeatures.start) - windowStart;

    const peaks = [
      { key: "P_index", color: "blue", label: "P Peak" },
      { key: "Q_index", color: "magenta", label: "Q Peak" },
      { key: "R_index", color: "red", label: "R Peak" },
      { key: "S_index", color: "cyan", label: "S Peak" },
      { key: "T_index", color: "green", label: "T Peak" },
    ];

    const points = peaks
      .map(({ key, color, label }) => {
        const idx = parseInt(beatFeatures[key]) - windowStart - start;
        if (idx >= 0 && idx < chartData.length) {
          const point = chartData[idx];
          return {
            time: point.time,
            value: point.value,
            color,
            label,
          };
        }
        return null;
      })
      .filter(Boolean);

    return (
      <Customized
        component={({ xAxisMap, yAxisMap }) => {
          const xScale = Object.values(xAxisMap)[0]?.scale;
          const yScale = Object.values(yAxisMap)[0]?.scale;

          if (!xScale || !yScale) return null;

          return (
            <g>
              {points.map((pt, i) => {
                const x = xScale(pt.time);
                const y = yScale(pt.value);

                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r={5}
                      fill={pt.color}
                      stroke="white"
                      strokeWidth={1}
                    />
                    <text x={x + 6} y={y - 6} fill={pt.color} fontSize={12}>
                      {`${pt.label}: ${pt.value.toFixed(2)} @ ${pt.time.toFixed(
                        2
                      )}s`}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        }}
      />
    );
  };

  if (!signal || !mask || !beatFeatures) {
    return <div>No data available</div>;
  }

  const CustomLegend = () => (
    <div style={{ display: "flex", flexDirection: "column", fontSize: "14px" }}>
      {[
        { name: "ECG Signal", color: "black", dash: "0" },
        { name: "P Wave", color: "blue", dash: "0" },
        { name: "QRS Complex", color: "red", dash: "0" },
        { name: "T Wave", color: "green", dash: "0" },
        { name: "PR Interval", color: "purple", dash: "4,4" },
        { name: "QT Interval", color: "orange", dash: "3,3" },
        { name: "ST Interval", color: "darkgreen", dash: "5,2" },
      ].map((item) => (
        <div
          key={item.name}
          style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
        >
          <svg width="24" height="10">
            <line
              x1="0"
              y1="5"
              x2="20"
              y2="5"
              stroke={item.color}
              strokeWidth="2"
              strokeDasharray={item.dash}
            />
          </svg>
          <span style={{ marginLeft: 4 }}>{item.name}</span>
        </div>
      ))}
      {[
        { name: "Amplitude P", color: "blue", dash: "0" },
        { name: "Amplitude Q", color: "magenta", dash: "0" },
        { name: "Amplitude R", color: "red", dash: "0" },
        { name: "Amplitude S", color: "cyan", dash: "0" },
        { name: "Amplitude T", color: "green", dash: "0" },
      ].map((item) => (
        <div
          key={item.name}
          style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
        >
          <svg width="16" height="16">
            <circle cx="8" cy="8" r="4" fill={item.color} />
          </svg>
          <span style={{ marginLeft: 4 }}>{item.name}</span>
        </div>
      ))}
    </div>
  );

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
              //type="time"
              //tickCount={5}
              //tickFormatter={(value) => value.toFixed(2)}
              domain={["auto", "auto"]}
            />
            <YAxis
              label={{ value: "Amplitude", angle: -90, position: "left" }}
              domain={yDomain}
              tick={false}
            />
            <Tooltip />
            <Legend
              verticalAlign="left"
              //layout="horizontal"
              //horizontalAlign="left"
              content={<CustomLegend />}
            />

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
            {renderBackgroundMasks()}
            {renderIntervals()}
            {renderAnnotations()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BeatFeatureViewer;
