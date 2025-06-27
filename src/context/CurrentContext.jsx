import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CurrentContext = createContext();

export const CurrentProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentMap, setCurrentMap] = useState({});

  const segments = location.pathname.split('/').filter(Boolean);
  const entity = segments[0] || null;
  const currentId = segments[1] || null;

  // aktualizuj mapę current na podstawie URL
  useEffect(() => {
    if (!entity || !currentId) return;
    setCurrentMap((prev) => ({
      ...prev,
      [entity]: currentId,
    }));
  }, [entity, currentId]);

  // programatyczna zmiana current dla encji
  const setCurrent = (entityName, id, preserveTab = true) => {
    const parts = [entityName, id];
    if (preserveTab && currentMap[entityName]) {
      parts.push(currentMap[entityName].tab || '');
    }
    navigate('/' + parts.filter(Boolean).join('/'));
  };

  return (
    <CurrentContext.Provider value={{
      currentMap,                // { users: '134', projects: '55', ... }
      current: currentMap[entity] || null, // current ID for active entity
      setCurrent,
    }}>
      {children}
    </CurrentContext.Provider>
  );
};

export const useCurrent = () => useContext(CurrentContext);
