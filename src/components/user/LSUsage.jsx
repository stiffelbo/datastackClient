import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  const precision = i === 0 ? 0 : i === 1 ? 1 : 2;
  return `${val.toFixed(precision)} ${units[i]}`;
};

// UTF-16 approx: 2 bytes per character for key+value
const calcEntryBytes = (key, value) => {
  const k = key ?? "";
  const v = value ?? "";
  return (String(k).length + String(v).length) * 2;
};

const safePreview = (raw, maxLen = 140) => {
  if (raw == null) return "";
  const s = String(raw);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + "…";
};

const tryPrettyJson = (raw) => {
  if (raw == null) return null;
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
};

const LSUsage = () => {
  // hook użyty “technicznie” — możesz go też całkiem usunąć, jeśli niepotrzebny
  // trzymamy tu np. ostatni filtr jako wygodę
  const [filter, setFilter] = useState("");

  const [items, setItems] = useState([]);

  const load = () => {
    const rows = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      const bytes = calcEntryBytes(key, value);
      rows.push({
        key,
        value,
        bytes,
      });
    }

    // najpierw największe
    rows.sort((a, b) => b.bytes - a.bytes);
    setItems(rows);
  };

  useEffect(() => {
    load();

    // Zmiany z innych kart/okien
    const onStorage = (e) => {
      // e.key może być null przy clear()
      load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totals = useMemo(() => {
    const totalBytes = items.reduce((acc, it) => acc + (it.bytes || 0), 0);
    return {
      totalBytes,
      count: items.length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = (filter || "").trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.key.toLowerCase().includes(q));
  }, [items, filter]);

  const handleDeleteOne = (key) => {
    try {
      localStorage.removeItem(key);
    } finally {
      load();
    }
  };

  const handleClearAll = () => {
    // ostrożnie: to czyści wszystko dla domeny
    localStorage.clear();
    load();
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1100 }}>
      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
        <Stack spacing={1.25}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Stack spacing={0.25}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                LocalStorage — użycie
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Podsumowanie zajętości LocalStorage dla bieżącej domeny (przybliżenie UTF-16).
              </Typography>
            </Stack>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Chip size="small" label={`Wpisy: ${totals.count}`} variant="outlined" />
              <Chip size="small" label={`Razem: ${formatBytes(totals.totalBytes)}`} variant="outlined" />
              <Tooltip title="Odśwież listę">
                <IconButton size="small" onClick={load}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider />

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              size="small"
              label="Filtr po kluczu"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Tooltip title="Uwaga: czyści wszystko w LocalStorage dla domeny">
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<WarningAmberIcon />}
                onClick={handleClearAll}
              >
                Wyczyść wszystko
              </Button>
            </Tooltip>
          </Box>

          <Divider />

          <List disablePadding sx={{ maxHeight: "60vh", overflow: "auto" }}>
            {filtered.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Brak pozycji dla filtra.
                </Typography>
              </Box>
            ) : (
              filtered.map((it) => {
                const pretty = tryPrettyJson(it.value);
                const preview = pretty ? safePreview(pretty.replace(/\s+/g, " "), 160) : safePreview(it.value, 160);

                return (
                  <ListItem
                    key={it.key}
                    divider
                    secondaryAction={
                      <Tooltip title="Usuń wpis">
                        <IconButton edge="end" onClick={() => handleDeleteOne(it.key)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    }
                    sx={{ alignItems: "flex-start" }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: "monospace" }}>
                            {it.key}
                          </Typography>
                          <Chip size="small" label={formatBytes(it.bytes)} variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5, fontFamily: "monospace" }}
                        >
                          {preview || "(puste)"}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })
            )}
          </List>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LSUsage;
