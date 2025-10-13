import { useState, useEffect, useCallback } from "react";

const useColumnConfigurator = ({ col, data, columnsSchema }) => {
  const [draft, setDraft] = useState(col);

  useEffect(() => {
    setDraft(col);
  }, [col]);

  const updateField = useCallback(
    (key, value) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      columnsSchema.updateField(col.field, { [key]: value });
    },
    [col.field, columnsSchema]
  );

  const reset = () => setDraft(col);
  const commit = () => columnsSchema.updateField(col.field, draft);

  return {
    col,
    draft,
    setDraft,
    updateField,
    reset,
    commit,
    columnsSchema,
    data,
  };
};

export default useColumnConfigurator;
