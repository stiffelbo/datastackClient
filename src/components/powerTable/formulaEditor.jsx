import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Typography,
  Paper,
  Popper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Divider,
  Tooltip,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import AbcIcon from "@mui/icons-material/Abc";
import NumbersIcon from "@mui/icons-material/Numbers";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FunctionsIcon from "@mui/icons-material/Functions";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";

//Utility functions

import {formulaAutocomplete} from './formulaEditorUtils';

/* Ikony typów */

const TypeIcon = ({ type = "string", sx }) => {
  switch (type) {
    case "number":
      return <NumbersIcon fontSize="small" sx={sx} />;
    case "date":
      return <CalendarTodayIcon fontSize="small" sx={sx} />;
    case "boolean":
      return <CheckCircleOutlineIcon fontSize="small" sx={sx} />;
    default:
      return <AbcIcon fontSize="small" sx={sx} />;
  }
};


export default function FormulaEditor({
  value,
  onChange,
  fieldsDict = [], // buildFieldsDict(columns, customFields)
  validate, // (expr) => { ok:boolean, error?:string }
  evaluate, // async (expr) => Promise<{ rows:[{value:any, type?:string, error?:string}], type?:string }>
  helperText,
  label = "Formuła",
  placeholder = "Używaj pól jako $price, ${Total amount}. Np. $qty * $price",
  functionsCatalog = DEFAULT_FUNCTIONS,
  maxPreview = 5,
  size = "small",
  
}) {
  const [expr, setExpr] = useState(value || "");
  const [tab, setTab] = useState(0); // 0: Formula, 1: Pomoc
  const [status, setStatus] = useState({ ok: true, error: "" });
  const [preview, setPreview] = useState(null);
  const [ac, setAC] = useState(null); // {active, range, query, suggestions}
  const inputRef = useRef(null);
  const popperRef = useRef(null);
  const anchorRef = useRef(null);

  // Sync z zewnątrz
  useEffect(() => { setExpr(value || ""); }, [value]);

  const dict = useMemo(() => fieldsDict, [fieldsDict]);

  const runValidate = useMemo(() => {
    return (text) => {
      if (!validate) return { ok: true };
      try {
        const res = validate(text);
        return res || { ok: true };
      } catch (e) {
        return { ok: false, error: e?.message || "Błąd walidacji" };
      }
    };
  }, [validate]);

  async function runPreview(text) {
    if (!evaluate) { setPreview(null); return; }
    try {
      const out = await evaluate(text, { limit: maxPreview });
      setPreview(out);
    } catch (e) {
      setPreview({ error: e?.message || "Błąd podglądu" });
    }
  }

  const handleChange = (e) => {
    const text = e.target.value;
    setExpr(text);
    onChange?.(text);

    // Autocomplete tylko gdy jest '$'
    const el = inputRef.current;
    const cursor = el ? el.selectionStart : text.length;
    const res = formulaAutocomplete(text, dict, cursor);
    setAC(res);

    // Walidacja (lekka) i preview
    const v = runValidate(text);
    setStatus(v);
    if (v.ok) runPreview(text);
  };

  const handleKeyDown = (e) => {
    if (!ac?.active || !ac?.suggestions?.length) return;
    const idx = ac.idx ?? 0;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = Math.min(idx + 1, ac.suggestions.length - 1);
      setAC({ ...ac, idx: nextIdx });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIdx = Math.max(idx - 1, 0);
      setAC({ ...ac, idx: nextIdx });
    } else if (e.key === "Enter") {
      if (ac.suggestions[idx]) {
        e.preventDefault();
        applySuggestion(ac.suggestions[idx]);
      }
    } else if (e.key === "Escape") {
      setAC(null);
    }
  };

  const applySuggestion = (item) => {
    if (!ac?.range) return;
    const { text, caret } = applyAutocomplete(expr, ac.range, item.name);
    setExpr(text);
    onChange?.(text);
    setAC(null);
    // Ustaw caret po wstawieniu
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el && typeof el.setSelectionRange === "function") {
        el.focus();
        el.setSelectionRange(caret, caret);
      }
    });
  };

  const insertTextAtCaret = (snippet) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? expr.length;
    const end = el?.selectionEnd ?? expr.length;
    const text = expr.slice(0, start) + snippet + expr.slice(end);
    setExpr(text);
    onChange?.(text);
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        const caret = start + snippet.length;
        el.setSelectionRange(caret, caret);
      }
    });
  };

  const insertFunc = (fn) => {
    const template = `${fn.name}(${fn.signature || ""})`;
    insertTextAtCaret(template);
  };

  return (
    <Stack gap={1.25}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>{label}</Typography>
        <Stack direction="row" gap={1} alignItems="center">
          {!status.ok ? (
            <Chip color="error" size="small" label={status.error || "Błąd"} />
          ) : (
            <Chip size="small" label={preview?.type ? `Typ: ${preview.type}` : ""} variant="outlined" />
          )}
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 1.25 }} ref={anchorRef}>
        <TextField
          inputRef={inputRef}
          multiline
          fullWidth
          minRows={3}
          maxRows={8}
          value={expr}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          size={size}
        />

        {/* Pasek szybkich wstawek funkcji */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
          <FunctionsIcon fontSize="small" />
          <Stack direction="row" gap={0.5} sx={{ flexWrap: "wrap" }}>
            {functionsCatalog.map((fn) => (
              <Tooltip key={fn.name} title={fn.desc} placement="top">
                <Chip
                  icon={<FunctionsIcon sx={{ fontSize: 16 }} />}
                  size="small"
                  label={fn.name}
                  onClick={() => insertFunc(fn)}
                  variant="outlined"
                />
              </Tooltip>
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* Podpowiedzi pól – Popper */}
      <Popper open={!!ac?.active} anchorEl={anchorRef.current} placement="bottom-start" style={{ zIndex: 1500 }}>
        <Paper elevation={4} sx={{ mt: 1, minWidth: 360, maxHeight: 280, overflow: "auto" }}>
          <List dense>
            {(ac?.suggestions || []).map((s, i) => (
              <ListItem key={s.name} disablePadding secondaryAction={
                <Chip size="small" label={s.type} sx={{ ml: 1 }} />
              }>
                <ListItemButton selected={i === (ac.idx ?? 0)} onClick={() => applySuggestion(s)}>
                  <ListItemIcon>
                    <TypeIcon type={s.type} />
                  </ListItemIcon>
                  <ListItemText primary={s.label} secondary={s.name} />
                </ListItemButton>
              </ListItem>
            ))}
            {(!ac?.suggestions || ac.suggestions.length === 0) && (
              <Box sx={{ p: 1, opacity: 0.7 }}>
                <Typography variant="caption">Brak dopasowań…</Typography>
              </Box>
            )}
          </List>
        </Paper>
      </Popper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 1 }}>
        <Tab label="Podgląd" />
        <Tab label="Pomoc" icon={<HelpOutlineIcon sx={{ fontSize: 16, ml: 0.5 }} />} iconPosition="end" />
      </Tabs>

      {tab === 0 ? (
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          {!evaluate ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Podłącz funkcję <code>evaluate(expr)</code>, aby zobaczyć podgląd wyników.
            </Typography>
          ) : preview?.error ? (
            <Typography color="error" variant="body2">{preview.error}</Typography>
          ) : preview?.rows ? (
            <Stack gap={0.75}>
              {(preview.rows || []).slice(0, maxPreview).map((r, idx) => (
                <Stack key={idx} direction="row" gap={1} alignItems="center">
                  <Chip size="small" variant="outlined" label={`#${idx + 1}`} />
                  {r?.error ? (
                    <Typography color="error" variant="body2">{r.error}</Typography>
                  ) : (
                    <Typography variant="body2">{String(r?.value)}</Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Brak danych do podglądu.
            </Typography>
          )}
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Typography variant="body2" gutterBottom>
            • Pola wstawiaj jako <b>$name</b> lub <b>${'{'}Nazwa pola{'}'}</b>.<br/>
            • Przykłady: <code>$qty * $price</code>, <code>dev($amount)</code>, <code>pct($amount) * 100</code>, <code>year($orderDate)</code>.
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" gutterBottom>
            Najczęstsze funkcje:
          </Typography>
          <List dense>
            {DEFAULT_FUNCTIONS.map(fn => (
              <ListItem key={fn.name} disableGutters>
                <ListItemIcon><FunctionsIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2"><b>{fn.name}</b>({fn.signature || ""})</Typography>}
                  secondary={fn.desc}
                />
                <Tooltip title="Wstaw szablon">
                  <IconButton size="small" onClick={() => insertFunc(fn)}>
                    <ContentPasteGoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {helperText && (
        <Typography variant="caption" sx={{ opacity: 0.7 }}>{helperText}</Typography>
      )}
    </Stack>
  );
}

/** Katalog skrótów funkcji do szybkich wstawek (UI) */
const DEFAULT_FUNCTIONS = [
  { name: "concat", signature: "$a, ' ', $b", desc: "Łączy ciągi znaków." },
  { name: "upper", signature: "$text", desc: "Wielkie litery." },
  { name: "lower", signature: "$text", desc: "Małe litery." },
  { name: "capitalize", signature: "$text", desc: "Pierwsza litera wielka." },
  { name: "round", signature: "$value, 2", desc: "Zaokrąglenie do n miejsc." },
  { name: "sum", signature: "$a, $b, $c", desc: "Suma argumentów." },
  { name: "avg", signature: "$a, $b, $c", desc: "Średnia argumentów." },
  { name: "year", signature: "$date", desc: "Rok z daty." },
  { name: "month", signature: "$date", desc: "Miesiąc (1–12)." },
  { name: "addDays", signature: "$date, 7", desc: "Dodaje dni do daty." },
  { name: "diffDays", signature: "$a, $b", desc: "Różnica dni między datami." },
  { name: "dev", signature: "$field", desc: "Odchylenie od średniej w grupie." },
  { name: "pct", signature: "$field", desc: "% udziału w sumie grupy (0–1)." },
  { name: "zscore", signature: "$field", desc: "Z-score względem grupy." },
  { name: "if", signature: "$cond, $then, $else", desc: "Warunek." },
];
