export function normalizeCellOptions(options = []) {
  return options.map((opt) => {
    if (opt && typeof opt === "object") {
      return {
        value: opt.value ?? opt.id ?? "",
        label: opt.label ?? opt.val ?? opt.name ?? String(opt.value ?? opt.id ?? ""),
        group: opt.group ?? "",
        disabled: Boolean(opt.disabled),
        title: opt.title ?? "",
      };
    }

    return {
      value: opt,
      label: String(opt),
      group: "",
      disabled: false,
      title: "",
    };
  });
}

