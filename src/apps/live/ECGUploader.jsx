import React, { useState } from "react";
// import axios from "axios";

const ECGUploader = ({ onSignalReceived }) => {
  const [datFile, setDatFile] = useState(null);
  const [heaFile, setHeaFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("dat_file", datFile);
    formData.append("hea_file", heaFile);

    try {
      const res = await fetch("http://localhost:8000/live/upload-ecg/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Signal received:", data.signal);
      onSignalReceived(data.signal, data.fs); // pass signal to parent
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setDatFile(e.target.files[0])}
        accept=".dat"
      />
      <input
        type="file"
        onChange={(e) => setHeaFile(e.target.files[0])}
        accept=".hea"
      />
      <button onClick={handleUpload}>Upload ECG</button>
    </div>
  );
};

export default ECGUploader;