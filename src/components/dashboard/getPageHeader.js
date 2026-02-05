export const getPageHeader = (row = {}, fields = []) => {
  if (!row || !fields?.length) return "";

  const getByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    const parts = String(path).split(".");
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur?.[p];
    }
    return cur;
  };

  const toSafeString = (val) => {
    if (val == null) return "";
    if (typeof val === "string") return val.trim();
    if (typeof val === "number") return Number.isFinite(val) ? String(val) : "";
    if (typeof val === "boolean") return val ? "Tak" : "Nie";

    // Date instance
    if (val instanceof Date) {
      return Number.isNaN(val.getTime()) ? "" : val.toISOString().slice(0, 10);
    }

    // ISO date-like strings (opcjonalnie zostawiamy jak jest)
    // if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);

    if (Array.isArray(val)) {
      const parts = val
        .map((x) => toSafeString(x))
        .filter((s) => s && s.trim());
      return parts.join(", ");
    }

    // object fallback
    try {
      // prefer common labels if present
      if (typeof val === "object") {
        const labelish =
          val.label ?? val.name ?? val.title ?? val.code ?? val.id ?? "";
        if (labelish != null && String(labelish).trim()) return String(labelish).trim();
      }
      return "";
    } catch {
      return "";
    }
  };

  const parts = fields
    .map((f) => toSafeString(getByPath(row, f)))
    .filter((s) => s && s.trim());

  return parts.length ? parts.join(" - ") : "";
};
