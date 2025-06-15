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
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
  Stack,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const SignalsTable = () => {
  const [signals, setSignals] = useState([]);
  const [filteredSignals, setFilteredSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc",
  });

  // Get unique diseases for filter
  const uniqueDiseases = [
    "all",
    ...new Set(signals.map((signal) => signal.disease)),
  ];

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch(`${API_URL}/acquisition/getSignals/`);
        const data = await response.json();
        if (data.status === "success") {
          setSignals(data.signals);
          setFilteredSignals(data.signals);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch signals data");
        setLoading(false);
      }
    };

    fetchSignals();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...signals];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (signal) =>
          signal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          signal.disease.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (startDate) {
      result = result.filter(
        (signal) => new Date(signal.timestamp) >= startDate
      );
    }
    if (endDate) {
      result = result.filter((signal) => new Date(signal.timestamp) <= endDate);
    }

    // Apply disease filter
    if (selectedDisease !== "all") {
      result = result.filter((signal) => signal.disease === selectedDisease);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === "timestamp") {
        return sortConfig.direction === "asc"
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      }
      return sortConfig.direction === "asc"
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    });

    setFilteredSignals(result);
  }, [signals, searchTerm, startDate, endDate, selectedDisease, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const handleRowClick = async (signal) => {
    try {
      const response = await fetch(
        `${API_URL}/acquisition/getSignal/?name=${encodeURIComponent(
          signal.name
        )}&timestamp=${encodeURIComponent(signal.timestamp)}`
      );
      const data = await response.json();
      if (data.status === "success") {
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

      {/* Filters Section */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" gap={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        <TextField
          select
          label="Disease"
          variant="outlined"
          size="small"
          value={selectedDisease}
          onChange={(e) => setSelectedDisease(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          {uniqueDiseases.map((disease) => (
            <MenuItem key={disease} value={disease}>
              {disease === "all" ? "All Diseases" : disease}
            </MenuItem>
          ))}
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { size: "small", sx: { minWidth: 150 } } }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { size: "small", sx: { minWidth: 150 } } }}
          />
        </LocalizationProvider>

        <Chip
          label={`${filteredSignals.length} results`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="signals table">
          <TableHead>
            <TableRow>
              <TableCell>
                Name
                <IconButton size="small" onClick={() => handleSort("name")}>
                  <SortIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                Timestamp
                <IconButton
                  size="small"
                  onClick={() => handleSort("timestamp")}
                >
                  <SortIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                Disease Analysis
                <IconButton size="small" onClick={() => handleSort("disease")}>
                  <SortIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSignals.map((signal, index) => (
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
                <TableCell>
                  <Chip
                    label={signal.disease}
                    color={signal.disease === "Normal" ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {filteredSignals.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No signals found matching the filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SignalsTable;
