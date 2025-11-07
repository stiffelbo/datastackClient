// utils.js
import * as XLSX from "xlsx";

/**
 * autoMap(hdrs, schema)
 *  - zwraca map { field -> header } z heurystycznym dopasowaniem
 */
export function autoMap(hdrs = [], schema = []) {
  const normalize = (s) => {
    if (s == null) return { original: "", spaced: "", compact: "" };
    let str = String(s).trim().toLowerCase();
    try {
      str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch (e) {
      // ignore if normalize not available
    }
    str = str.replace(/[^a-z0-9\s]/g, " ");
    str = str.replace(/\s+/g, " ").trim();
    const compact = str.replace(/\s+/g, "");
    return { original: String(s), spaced: str, compact };
  };

  const hdrNorm = hdrs.map((h, idx) => {
    const n = normalize(h);
    return { raw: h, idx, spaced: n.spaced, compact: n.compact, used: false };
  });

  const targetsAll = (schema || []).map((f) => ({ field: f.field, computed: !!f.computed }));
  const targets = [
    ...targetsAll.filter((t) => !t.computed),
    ...targetsAll.filter((t) => t.computed),
  ].map((t, idx) => ({ ...t, origIndex: idx }));

  const tgtNorm = targets.map((t) => {
    const n = normalize(t.field);
    return { field: t.field, computed: t.computed, spaced: n.spaced, compact: n.compact, mapped: "" };
  });

  const map = {};
  (schema || []).forEach((s) => {
    map[s.field] = "";
  });

  // 1) exact compact match
  for (const t of tgtNorm) {
    if (t.computed) continue;
    for (const h of hdrNorm) {
      if (h.used) continue;
      if (h.compact === t.compact && h.compact !== "") {
        map[t.field] = h.raw;
        h.used = true;
        t.mapped = h.raw;
        break;
      }
    }
  }

  // 2) positional fallback
  const remainingTargets = tgtNorm.filter((t) => !t.computed && !t.mapped);
  const remainingHdrs = hdrNorm.filter((h) => !h.used).sort((a, b) => a.idx - b.idx);
  const posCount = Math.min(remainingTargets.length, remainingHdrs.length);
  for (let i = 0; i < posCount; i++) {
    const t = remainingTargets[i];
    const h = remainingHdrs[i];
    if (!t.mapped && !h.used) {
      map[t.field] = h.raw;
      h.used = true;
      t.mapped = h.raw;
    }
  }

  // 3) contains/includes heuristic
  for (const t of tgtNorm) {
    if (t.computed || t.mapped) continue;
    for (const h of hdrNorm) {
      if (h.used) continue;
      if (!t.spaced && !h.spaced) continue;
      if (h.spaced.includes(t.spaced) || t.spaced.includes(h.spaced)) {
        map[t.field] = h.raw;
        h.used = true;
        t.mapped = h.raw;
        break;
      }
      if (h.compact.includes(t.compact) || t.compact.includes(h.compact)) {
        map[t.field] = h.raw;
        h.used = true;
        t.mapped = h.raw;
        break;
      }
    }
  }

  // leave computed fields empty (already initialized)
  return map;
}

/**
 * downloadTemplate(importSchema, filename?)
 */
export function downloadTemplate(importSchema = [], filename = null) {
  try {
    const hdrs = (importSchema || []).map((f) => f.field);
    const labels = (importSchema || []).map((f) => f.description || "");
    const aoa = [hdrs, labels];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "template");
    const name = filename ?? `${importSchema?.[0]?.table ?? "import"}-template.xlsx`;
    XLSX.writeFile(wb, name);
    return true;
  } catch (e) {
    throw e;
  }
}

//HELPERS
// --- prosta normalizacja dat ---
const EXCEL_EPOCH = 25569;      // Excel -> Unix epoch offset (dni)
const MS_PER_DAY  = 86400000;
const pad2 = (n) => String(n).padStart(2, '0');
const ymdUTC = (d) => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;

const isExcelSerial = (n) => typeof n === 'number' && isFinite(n) && n > 20000 && n < 90000;
const excelToDate = (n) => {
  const days = Math.floor(n - EXCEL_EPOCH);
  const frac = n - Math.floor(n);
  return new Date(days * MS_PER_DAY + Math.round(frac * MS_PER_DAY));
};

export function normalizeToIsoDate(val) {
  if (val == null || val === '') return val;

  const pad2 = (n) => String(n).padStart(2, '0');
  const toIsoYmd = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

  // 1) Już Date -> potraktuj jako lokalny dzień, ale zwróć bez przesunięć:
  if (val instanceof Date && !isNaN(val)) {
    return toIsoYmd(val.getFullYear(), val.getMonth() + 1, val.getDate());
  }

  // zamień do stringa jednolicie
  const s = typeof val === 'string' ? val.trim() : String(val).trim();

  // 2) ISO "YYYY-MM-DD" -> zwróć wprost (bez konwersji do Date)
  const isoDateOnly = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    return `${isoDateOnly[1]}-${isoDateOnly[2]}-${isoDateOnly[3]}`;
  }

  // 3) DMY: dd[/.-]mm[/.-](yyyy|yy) – EU format
  {
    const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2}|\d{4})$/);
    if (m) {
      let [, d, mo, y] = m;
      if (y.length === 2) y = (Number(y) >= 70 ? '19' : '20') + y;
      const dNum = Number(d), mNum = Number(mo), yNum = Number(y);
      if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
        // Użyj Date.UTC, żeby uniknąć przesunięć strefy
        const dt = new Date(Date.UTC(yNum, mNum - 1, dNum));
        if (!isNaN(dt)) return `${yNum}-${pad2(mNum)}-${pad2(dNum)}`;
      }
    }
  }

  // 4) Excel serial (number lub string-liczba)
  if (/^\d+(\.\d+)?$/.test(s)) {
    const num = Number(s);
    if (isExcelSerial(num)) {
      const dt = excelToDate(num); // Twoja funkcja
      return toIsoYmd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    }
  }

  // 5) Pełne ISO/timestamp z T/Z/offsetem -> wtedy dopuszczamy new Date
  if (/[TzZ+\-]\d{2}:?\d{2}?/.test(s) || /^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const tryIso = new Date(s);
    if (!isNaN(tryIso)) {
      return toIsoYmd(tryIso.getUTCFullYear(), tryIso.getUTCMonth() + 1, tryIso.getUTCDate());
    }
  }

  // 6) Opcjonalnie: bezpieczny MDY (US) jeśli ktoś jednak poda MM/DD/YYYY
  //    Uwaga: tylko jeżeli miesiąc > 12 lub dzień > 12 rozstrzyga kolizję,
  //    w przeciwnym razie lepiej zwrócić oryginał, żeby nic nie zepsuć.
  {
    const mdy = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (mdy) {
      const mm = Number(mdy[1]);
      const dd = Number(mdy[2]);
      const yyyy = Number(mdy[3]);
      // parsuj jako MDY tylko jeśli jednoznaczne (np. 13/02/2025)
      if ((mm > 12 && dd <= 31) || (dd > 12 && mm <= 12)) {
        const y = yyyy, m = mm, d = dd;
        const dt = new Date(Date.UTC(y, m - 1, d));
        if (!isNaN(dt)) return toIsoYmd(y, m, d);
      }
    }
  }

  // 7) Nie rozpoznano — oddaj oryginał
  return val;
}



/**
 * buildMappedRows(rows, importSchema, mapping)
 */
export function buildMappedRows(rows = [], importSchema = [], mapping = {}) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  return rows.map((r) => {
    const out = {};
    for (const f of importSchema) {
      const key = f.field;
      const mappedHeader = mapping?.[key];

      if (f.computed) {
        out[key] = null;
        continue;
      }

      let val = null;

      if (mappedHeader && mappedHeader !== "__none__") {
        if (Object.prototype.hasOwnProperty.call(r, mappedHeader)) val = r[mappedHeader];
        else {
          const found = Object.keys(r).find((k) => k.toLowerCase() === String(mappedHeader).toLowerCase());
          val = found ? r[found] : null;
        }
      } else if (mappedHeader === "__none__") {
        val = null;
      }

      // 🔹 Koercja typów wg schematu — na razie interesuje nas data
      if (f.type === 'date' || f.input === 'date') {
        val = normalizeToIsoDate(val);
      }

      out[key] = val;
    }
    return out;
  });
}


/**
 * computeMappingStats(importSchema, mapping, rows)
 */
export function computeMappingStats(importSchema = [], mapping = {}, rows = []) {
  const totalRows = Array.isArray(rows) ? rows.length : 0;

  const mappedCount = (importSchema || []).reduce((acc, f) => {
    const v = mapping?.[f.field];
    return acc + ((v && v !== "") ? 1 : 0);
  }, 0);

  const requiredMissingList = (importSchema || [])
    .filter((f) => f.required)
    .filter((f) => {
      const m = mapping?.[f.field];
      const hasDefault = Object.prototype.hasOwnProperty.call(f, "default") && f.default !== null && f.default !== "";
      const isComputed = !!f.computed;
      return !((m && m !== "") || hasDefault || isComputed);
    })
    .map((f) => f.field);

  const uploadEnabled = requiredMissingList.length === 0 && totalRows > 0;

  return { totalRows, mappedCount, requiredMissingList, uploadEnabled };
}

/**
 * parseFile({file, setParsing, setError, setMapping, setHeaders, setRows, importSchema})
 *
 * - importSchema MUST be passed (used by autoMap)
 * - setParsing, setError etc are optional (utils will guard)
 */
export async function parseFile(file, importSchema = null) {
  if (!file) {
    throw new Error("No file provided");
  }

  try {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: "array", cellDates: true });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      // no sheets in workbook
      return { headers: [], rows: [], mapping: {} };
    }
    const ws = wb.Sheets[sheetName];

    // Parse rows using first header row as keys
    const json = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false, dateNF: "yyyy-mm-dd" });

    let hdrs = [];
    if (Array.isArray(json) && json.length > 0) {
      hdrs = Object.keys(json[0]);
    } else {
      // fallback: read first row explicitly as header
      const headerRow = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: "" })[0] || [];
      hdrs = headerRow.map((h) => String(h ?? ""));
    }

    // compute autoMap if importSchema provided (otherwise empty map)
    const mapping = Array.isArray(importSchema) ? autoMap(hdrs, importSchema) : {};

    return { headers: hdrs, rows: json, mapping };
  } catch (e) {
    // rethrow so caller can decide how to surface error
    throw e;
  }
}
