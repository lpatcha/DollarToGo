'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Link,
  IconButton,
  InputAdornment,
  Alert,
  Divider
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, CheckCircle, RefreshCw, ArrowLeft, Send } from 'lucide-react';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If a code is provided in URL, we are in "Reset" mode.
  // If no code, we are in "Forgot" (request link) mode.
  const isResetMode = !!code;

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { code, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
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
          {success ? (
            <Stack spacing={4} textAlign="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0, 208, 132, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  mx: 'auto'
                }}
              >
                <CheckCircle size={40} />
              </Box>
              <Box>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 800, 
                    fontFamily: 'var(--font-outfit)',
                    letterSpacing: '-0.02em',
                    color: 'text.primary'
                  }}
                >
                  {isResetMode ? 'Password Reset!' : 'Check Your Email'}
                </Typography>
                <Typography color="text.secondary" sx={{ fontFamily: 'var(--font-outfit)' }}>
                  {isResetMode
                    ? 'Your password has been successfully updated. Redirecting to login...'
                    : `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions.`}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push('/login')}
                startIcon={<ArrowLeft size={18} />}
                sx={{ 
                  borderRadius: 3, 
                  py: 1.5, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  fontSize: '1rem' 
                }}
              >
                Return to Login
              </Button>
            </Stack>
          ) : (
            <form onSubmit={isResetMode ? handleResetSubmit : handleForgotSubmit}>
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
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5
                    }}
                  >
                    DollarToGo
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'text.primary',
                      mb: 0.5
                    }}
                  >
                    {isResetMode ? 'New Password' : 'Forgot Password?'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isResetMode
                      ? 'Securely reset your account access'
                      : 'We will send you a verification link to your email'}
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Stack spacing={3}>
                  {!isResetMode ? (
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={18} color="#64748B" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                  ) : (
                    <>
                      <TextField
                        fullWidth
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={18} color="#64748B" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <RefreshCw size={18} color="#64748B" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    startIcon={isResetMode ? <RefreshCw size={18} /> : <Send size={18} />}
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 208, 132, 0.25)'
                      }
                    }}
                  >
                    {loading ? (isResetMode ? 'Updating...' : 'Sending Link...') : (isResetMode ? 'Update Password' : 'Send Reset Link')}
                  </Button>
                </Stack>

                <Divider>
                  <Typography variant="body2" color="text.secondary">OR</Typography>
                </Divider>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Remembered your password?{' '}
                  <Link 
                    href="/login" 
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none', 
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Stack>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
