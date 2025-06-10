import React from "react";
import "./SignalFeaturesViewer.css";

const SignalFeaturesViewer = ({ signalFeatures }) => {
  if (!signalFeatures) return null;

  const renderFeatureSection = (title, features) => (
    <div className="feature-section">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Mean</th>
            <th>Std</th>
            <th>Min</th>
            <th>Max</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.name}>
              <td>{feature.label}</td>
              <td>{signalFeatures[`${feature.name}_mean`]?.toFixed(2)}</td>
              <td>{signalFeatures[`${feature.name}_std`]?.toFixed(2)}</td>
              <td>{signalFeatures[`${feature.name}_min`]?.toFixed(2)}</td>
              <td>{signalFeatures[`${feature.name}_max`]?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBeatMetrics = () => (
    <div className="feature-section">
      <h3>Beat Metrics</h3>
      <div>
        <div className="beat-metrics-column" style={{ width: "100%" }}>
          <h4>Beat Metrics</h4>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Beat Type</th>
                <th>Count</th>
                <th>Ratio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Normal Beats (N)</td>
                <td>{signalFeatures.count_n || 0}</td>
                <td>{(signalFeatures.ratio_n * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Left Bundle Branch Block (L)</td>
                <td>{signalFeatures.count_l || 0}</td>
                <td>{(signalFeatures.ratio_l * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Right Bundle Branch Block (R)</td>
                <td>{signalFeatures.count_r || 0}</td>
                <td>{(signalFeatures.ratio_r * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Premature Ventricular Contractions (V)</td>
                <td>{signalFeatures.count_v || 0}</td>
                <td>{(signalFeatures.ratio_v * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Paced Beats (/)</td>
                <td>{signalFeatures["count_/"] || 0}</td>
                <td>{(signalFeatures["ratio_/"] * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Other Beats</td>
                <td>{signalFeatures.count_else || 0}</td>
                <td>{(signalFeatures.ratio_else * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const durationFeatures = [
    { name: "duree_qrs_ms", label: "QRS Duration (ms)" },
    { name: "duree_p_ms", label: "P Wave Duration (ms)" },
    { name: "duree_t_ms", label: "T Wave Duration (ms)" },
    { name: "intervalle_qt_ms", label: "QT Interval (ms)" },
    { name: "intervalle_pr_ms", label: "PR Interval (ms)" },
    { name: "intervalle_st_ms", label: "ST Interval (ms)" },
  ];

  const amplitudeFeatures = [
    { name: "amplitude_p", label: "P Wave Amplitude" },
    { name: "amplitude_q", label: "Q Wave Amplitude" },
    { name: "amplitude_r", label: "R Wave Amplitude" },
    { name: "amplitude_s", label: "S Wave Amplitude" },
    { name: "amplitude_t", label: "T Wave Amplitude" },
  ];

  const ratioFeatures = [
    { name: "t_r_ratio", label: "T/R Ratio" },
    { name: "p_r_ratio", label: "P/R Ratio" },
  ];

  const otherFeatures = [
    { name: "qrs_area", label: "QRS Area" },
    { name: "slope_qr", label: "QR Slope" },
    { name: "slope_rs", label: "RS Slope" },
  ];

  const rhythmFeatures = [
    { name: "heart_rate_bpm", label: "Heart Rate (BPM)" },
    { name: "local_rmssd", label: "RMSSD" },
  ];

  return (
    <div className="signal-features-viewer">
      <h2>Signal Features</h2>
      {renderBeatMetrics()}
      {renderFeatureSection("Duration Features", durationFeatures)}
      {renderFeatureSection("Amplitude Features", amplitudeFeatures)}
      {renderFeatureSection("Ratio Features", ratioFeatures)}
      {renderFeatureSection("Other Features", otherFeatures)}
      {renderFeatureSection("Rhythm Features", rhythmFeatures)}

      <div className="feature-section">
        <h3>Additional Metrics</h3>
        <table>
          <tbody>
            <tr>
              <td>T Wave Inversion</td>
              <td>{signalFeatures.t_inversion_mean?.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Premature Beats</td>
              <td>{signalFeatures.premature_beat_sum}</td>
            </tr>
            <tr>
              <td>Bigeminy</td>
              <td>{signalFeatures.bigeminy_sum}</td>
            </tr>
            <tr>
              <td>Trigeminy</td>
              <td>{signalFeatures.trigeminy_sum}</td>
            </tr>
            <tr>
              <td>Number of Beats</td>
              <td>{signalFeatures.num_beats}</td>
            </tr>
            <tr>
              <td>RR Interval Std Dev</td>
              <td>{signalFeatures.std_intervalle_rr_ms?.toFixed(2)} ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SignalFeaturesViewer;
