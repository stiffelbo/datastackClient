import { Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Logout = ({ redirect = true, label = 'Wyloguj się' }) => {
  const { logout, user } = useAuth();
  console.log(user);
  const navigate = useNavigate();

  const handleClick = async () => {
    await logout();
    if (redirect) navigate('/login');
  };

  return (
    <Button variant="outlined" color="secondary" onClick={handleClick}>
      {label}
    </Button>
  );
};

export default Logout;
