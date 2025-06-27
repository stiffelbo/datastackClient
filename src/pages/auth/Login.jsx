import React, { useState } from 'react';
import { useNavigate,  Link as RouterLink  } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError('Błędny email lub hasło');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" mb={3} align="center">
            Logowanie do Datastack
          </Typography>

          <Button 
            color={'inherit'} 
            component={RouterLink} 
            to={'/register'}
            size="small"
            variant='text'
          >
            Zarejestruj się
          </Button>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Hasło"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && (
              <Typography color="error" mt={1} mb={2}>
                {error}
              </Typography>
            )}

            <Box mt={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Zaloguj się'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
