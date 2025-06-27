import { createContext, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavContext = createContext();

export const NavProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split('/').filter(Boolean);

  const page = segments[0] || null; // top-level page (e.g. 'users')

  const goToPage = (newPage) => {
    const path = '/' + [newPage].filter(Boolean).join('/');
    if (newPage !== page) navigate(path);
  };

  return (
    <NavContext.Provider value={{ page, goToPage }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);
