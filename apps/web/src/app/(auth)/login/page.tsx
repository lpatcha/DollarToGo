'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Stack,
  IconButton,
  InputAdornment,
  Divider,
  Alert
} from '@mui/material';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '@/store/slices/authSlice';
import { RootState } from '@/store/rootReducer';

export default function LoginPage() {

  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0, 208, 132, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            bgcolor: 'background.paper',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={4}>
            <Box textAlign="center">
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  background: (theme) => `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                DollarToGo
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Please enter your details.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Link
                    href="/reset-password"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  startIcon={<LogIn size={20} />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </Stack>
            </form>

            <Divider>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don't have an account?{' '}
              <Link
                href="/register"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign up for free
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
