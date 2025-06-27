import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TabsContext = createContext();

export const TabsProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabsMap, setTabsMap] = useState({});

  const segments = location.pathname.split('/').filter(Boolean);
  const entity = segments[0] || null;
  const tab = segments[2] || null;

  // aktualizacja tabsMap przy zmianie URL
  useEffect(() => {
    if (!entity || !tab) return;
    setTabsMap((prev) => ({
      ...prev,
      [entity]: tab,
    }));
  }, [entity, tab]);

  // zmiana zakładki programatycznie
  const setTab = (entityName, currentId, newTab) => {
    const path = [entityName, currentId, newTab].filter(Boolean).join('/');
    navigate(`/${path}`);
  };

  return (
    <TabsContext.Provider value={{
      tabsMap,                    // { users: 'worklog', projects: 'files', ... }
      tab: tabsMap[entity] || null, // active tab for current entity
      setTab,
    }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => useContext(TabsContext);
