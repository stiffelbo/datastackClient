import { useCurrentItemContext } from "../context/CurrentItemContext";
import { useHistory } from "react-router-dom";
import { saveCurrent } from "../services/currentService"; // API call

export const useCurrentItem = (entity) => {
  const { currentItem, dispatch } = useCurrentItemContext();
  const history = useHistory();

  const setCurrent = async (value) => {
    try {
      // 🔹 If the same value is selected again, clear it instead
      if (currentItem[entity] === value) {
        //console.log(`🔄 Deselecting current item: ${value}`);
        dispatch({ type: "CLEAR_CURRENT_ITEM", entity });
        history.push(`/gem/${entity}`); // Reset URL
        return;
      }

      // 🔹 Otherwise, proceed with selection
      dispatch({ type: "SET_CURRENT_ITEM", entity, payload: value });

      if (value) {
        // 🔥 Save selection in the database
        const formData = new FormData();
        formData.append("name", entity);
        formData.append("value", value);
        await saveCurrent(formData);

        // 🔄 Update URL with selected item
        history.push(`/gem/${entity}/${value}`);
      } else {
        history.push(`/gem/${entity}`);
      }
    } catch (error) {
      console.error("Error updating current item:", error);
    }
  };

  const clearCurrent = () => {
    dispatch({ type: "CLEAR_CURRENT_ITEM", entity });
    history.push(`/gem/${entity}`); // Reset URL when cleared
  };

  return {
    current: currentItem[entity] || "",
    setCurrent,
    clearCurrent,
  };
};
