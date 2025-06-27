import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
} from '@mui/material';
import http from '../../http';

const Register = () => {
  const [form, setForm] = useState({
    email: '',
    name: '',
    last_name: '',
    password: '',
    confirm: '',
  });
 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const {refreshUser} = useAuth();
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError('Hasła nie są zgodne');
      return;
    }

    setLoading(true);
    try {
      const { user } = await http.post('auth/register.php', form);
      toast.success(`Rejestracja ${user.name} ${user.last_name} zakończona`);
      await refreshUser();
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Błąd rejestracji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Rejestracja użytkownika
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="name"
            label="Imię"
            required
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="last_name"
            label="Nazwisko"
            required
            value={form.last_name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="password"
            label="Hasło"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="confirm"
            label="Powtórz hasło"
            type="password"
            required
            value={form.confirm}
            onChange={handleChange}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
