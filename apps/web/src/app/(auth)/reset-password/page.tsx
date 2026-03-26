'use client';

import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, CheckCircle, RefreshCw } from 'lucide-react';
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
  const [error, setError] = useState(null);

  // If a code is provided in URL, we are in "Reset" mode.
  // If no code, we are in "Forgot" (request link) mode.
  const isResetMode = !!code;

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/forgot-password', { email });
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
      const response = await api.post('/auth/reset-password', { code, newPassword: password });
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
        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(0, 208, 132, 0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
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
            <Stack spacing={3} textAlign="center">
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
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'var(--font-outfit)' }}>
                {isResetMode ? 'Password Reset!' : 'Check Your Email'}
              </Typography>
              <Typography color="text.secondary" sx={{ fontFamily: 'var(--font-outfit)' }}>
                {isResetMode 
                  ? 'Your password has been successfully updated. Redirecting to login...' 
                  : `If an account with that email exists, we've sent a password reset link to your email.`}
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => router.push('/login')}
                sx={{ borderRadius: 3, py: 1.5, textTransform: 'none', mt: 2 }}
              >
                Back to Login
              </Button>
            </Stack>
          ) : (
            <form onSubmit={isResetMode ? handleResetSubmit : handleForgotSubmit}>
              <Stack spacing={4}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'var(--font-outfit)',
                      fontWeight: 800,
                      background: (theme) => `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {isResetMode ? 'New Password' : 'Forgot Password?'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontFamily: 'var(--font-outfit)' }}>
                    {isResetMode 
                      ? 'Please enter your new password below.' 
                      : 'Enter your email address and we will send you a reset link.'}
                  </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                <Stack spacing={2.5}>
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
                            <Mail size={18} />
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
                              <Lock size={18} />
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
                              <RefreshCw size={18} />
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
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-outfit)'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : (isResetMode ? 'Update Password' : 'Send Reset Link')}
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontFamily: 'var(--font-outfit)' }}>
                  Suddenly remembered?{' '}
                  <Link href="/login" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600 }}>
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
