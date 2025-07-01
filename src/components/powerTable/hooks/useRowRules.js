const useRowRules = (row, rules = []) => {
    // Apply first matching rule for now
    for (const rule of rules) {
      // Placeholder — real parser later
      if (rule.condition === 'always') {
        return rule.style;
      }
    }
    return {};
  };
  
  export default useRowRules;
  