'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Stack, 
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { CheckCircle, XCircle, UserPlus } from 'lucide-react';
import api from '@/lib/api';

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const emailParam = searchParams.get('email');
  const statusParam = searchParams.get('status');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'inactive'>('loading');
  const [message, setMessage] = useState('Activating your account...');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const isAttempted = useRef(false);

  useEffect(() => {
    // If we're coming from a failed login with status=inactive, skip activation attempt
    if (statusParam === 'inactive') {
      setStatus('inactive');
      setMessage('Your account is currently not active.');
      return;
    }

    const activate = async () => {
      // Prevent double-execution or execution without a code
      if (!code || isAttempted.current) return;
      
      isAttempted.current = true;

      try {
        const response = await api.post('/auth/activate', { code });
        setStatus('success');
        setMessage(response.data.message || 'Account activated successfully!');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Activation failed. The link may be invalid or expired.');
      }
    };

    activate();
  }, [code, statusParam, router]);

  const handleResendActivation = async () => {
    if (!emailParam) return;
    setResendLoading(true);
    try {
      const response = await api.post('/auth/resend-activation', { email: emailParam });
      setResendSuccess(true);
      setMessage(response.data.message || 'A new link has been sent!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resend activation link.');
    } finally {
      setResendLoading(false);
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
            textAlign: 'center'
          }}
        >
          <Stack spacing={4} alignItems="center">
            {status === 'loading' && (
              <>
                <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    fontFamily: 'var(--font-outfit)',
                    color: 'text.secondary'
                  }}
                >
                  {message}
                </Typography>
              </>
            )}

            {status === 'inactive' && (
              <>
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(99, 102, 241, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'secondary.main',
                    mb: 1
                  }}
                >
                  <UserPlus size={40} />
                </Box>
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
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    mb: 2
                  }}
                >
                  Account Inactive
                </Typography>
                
                {resendSuccess ? (
                  <Alert severity="success" sx={{ width: '100%', borderRadius: 3, fontFamily: 'var(--font-outfit)' }}>
                    {message}
                  </Alert>
                ) : (
                  <>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontFamily: 'var(--font-outfit)' }}
                    >
                      Your account (<b>{emailParam}</b>) is currently not active. Please check your mail or resend the activation link below.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      disabled={resendLoading}
                      onClick={handleResendActivation}
                      sx={{ 
                        borderRadius: 3, 
                        py: 1.5, 
                        mt: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-outfit)',
                        fontWeight: 700
                      }}
                    >
                      {resendLoading ? <CircularProgress size={24} color="inherit" /> : 'Resend Activation Link'}
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="text" 
                  color="inherit"
                  onClick={() => router.push('/login')}
                  sx={{ textTransform: 'none', fontFamily: 'var(--font-outfit)' }}
                >
                  Back to Login
                </Button>
              </>
            )}

            {status === 'success' && (
              <>
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
                    mb: 1
                  }}
                >
                  <CheckCircle size={40} />
                </Box>
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
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  Account Activated!
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ fontFamily: 'var(--font-outfit)' }}
                >
                  {message}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontFamily: 'var(--font-outfit)', fontStyle: 'italic' }}
                >
                  Redirecting to login page in a few seconds...
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => router.push('/login')}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5, 
                    mt: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 700
                  }}
                >
                  Go to Login Now
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(239, 68, 68, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'error.main',
                    mb: 1
                  }}
                >
                  <XCircle size={40} />
                </Box>
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
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'error.main',
                    mb: 1
                  }}
                >
                  Activation Failed
                </Typography>
                <Alert severity="error" sx={{ width: '100%', borderRadius: 3, fontFamily: 'var(--font-outfit)' }}>
                  {message}
                </Alert>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontFamily: 'var(--font-outfit)' }}
                >
                  If you think this is a mistake, please try registering again or contact support.
                </Typography>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => router.push('/register')}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5, 
                    mt: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 700
                  }}
                >
                  Back to Registration
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
