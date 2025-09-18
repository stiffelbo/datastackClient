// hooks/useGroupBy.js
import { useContext } from "react";
import { GroupByContext } from "../context/GroupByContext";

export const useGroupBy = (entity) => {
  const context = useContext(GroupByContext);
  if (!context) {
    throw new Error("useGroupBy must be used within GroupByProvider");
  }

  if (!entity) {
    return {
      groupBy: null,
      setGroupBy: () => {},
      clearGroupBy: () => {},
    };
  }

  const { groupBy, dispatch } = context;

  return {
    groupBy: groupBy[entity] || null,
    setGroupBy: (payload) => dispatch({ type: "SET_GROUP_BY", entity, payload }),
    clearGroupBy: () => dispatch({ type: "CLEAR_GROUP_BY", entity }),
  };
};
