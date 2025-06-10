import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const SignalsTable = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/acquisition/getSignals/"
        );
        const data = await response.json();
        if (data.status === "success") {
          setSignals(data.signals);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch signals data");
        setLoading(false);
      }
    };

    fetchSignals();
  }, []);

  const handleRowClick = async (signal) => {
    const API_URL = process.env.REACT_APP_API_URL;
    try {
      const response = await fetch(
        `${API_URL}/acquisition/getSignal/?name=${encodeURIComponent(
          signal.name
        )}&timestamp=${encodeURIComponent(signal.timestamp)}`
      );
      const data = await response.json();
      if (data.status === "success") {
        // Navigate to Acquisition page with the signal data
        navigate("/acquisition", { state: { signalData: data.result } });
      }
    } catch (err) {
      console.error("Failed to fetch signal data:", err);
    }
  };

  if (loading) {
    return <Typography>Loading signals data...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography variant="h6" gutterBottom component="div">
        ECG Signals History
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="signals table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Disease Analysis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {signals.map((signal, index) => (
              <TableRow
                key={index}
                onClick={() => handleRowClick(signal)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <TableCell>{signal.name}</TableCell>
                <TableCell>
                  {new Date(signal.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{signal.disease}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SignalsTable;
