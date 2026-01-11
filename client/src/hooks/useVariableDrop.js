import { useCallback } from "react";

export const useVariableDrop = () => {
  const allowDrop = useCallback((e) => {
    e.preventDefault();
  }, []);

  const onVariableDrop = useCallback(
    (setter, currentValue) => (e) => {
      e.preventDefault();
      const variable = e.dataTransfer.getData("application/variable");
      if (!variable) return;
      setter(`${currentValue}${variable}`);
    },
    []
  );

  return { allowDrop, onVariableDrop };
};
