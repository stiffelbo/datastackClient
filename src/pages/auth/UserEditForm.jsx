import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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

const UserEditForm = ({ data = {}, sx = {} }) => {
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    login: '',
    password: '',
    confirm: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useAuth();

  useEffect(() => {
    setForm({
      email: data.email || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      login: data.login || '',
      password: '',
      confirm: '',
    });
  }, [data]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password || form.confirm) {
      if (form.password !== form.confirm) {
        setError('Hasła nie są zgodne');
        return;
      }

      if (form.password.length < 5) {
        setError('Hasło musi mieć minimum 5 znaków');
        return;
      }
    }

    const payload = {
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      login: form.login,
    };

    if (form.password) {
      payload.password = form.password;
    }

    setLoading(true);

    try {
      const response = await http.post('auth/update.php', payload);
      const updatedUser = response.user || response.data?.user;

      toast.success('Dane użytkownika zostały zaktualizowane');

      await refreshUser();

      setForm((prev) => ({
        ...prev,
        password: '',
        confirm: '',
      }));
    } catch (err) {
      setError(err?.response?.data?.error || 'Błąd aktualizacji danych');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{...sx}}>
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edycja danych użytkownika
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>

          <TextField
            fullWidth
            margin="normal"
            name="login"
            label="Login"
            required
            value={form.login}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            name="password"
            label="Nowe hasło"
            type="password"
            value={form.password}
            onChange={handleChange}
            helperText="Zostaw puste, jeśli nie chcesz zmieniać hasła"
          />

          <TextField
            fullWidth
            margin="normal"
            name="confirm"
            label="Powtórz nowe hasło"
            type="password"
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
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserEditForm;