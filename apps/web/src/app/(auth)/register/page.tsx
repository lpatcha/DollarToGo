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
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/rootReducer';
import { loginFailure } from '@/store/slices/authSlice'; // Re-using for simplicity in demo
import api from '@/lib/api';

export default function SignupPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState<'USER' | 'DRIVER'>('USER');
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: '',
    mobile: ''
  });
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRoleChange = (
    event: React.MouseEvent<HTMLElement>,
    newRole: 'USER' | 'DRIVER',
  ) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/register', { ...formData, role });
      // Redirect to login after successful signup
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                Join DollarToGo
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start your journey with us today.
              </Typography>
            </Box>

            <Box display="flex" justifyContent="center">
              <ToggleButtonGroup
                color="primary"
                value={role}
                exclusive
                onChange={handleRoleChange}
                aria-label="Platform"
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderRadius: 3,
                  p: 0.5,
                  '& .MuiToggleButton-root': {
                    px: 4,
                    borderRadius: 2.5,
                    border: 'none',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' }
                    }
                  }
                }}
              >
                <ToggleButton value="USER">Rider</ToggleButton>
                <ToggleButton value="DRIVER">Driver</ToggleButton>
              </ToggleButtonGroup>
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
                  label="Full Name"
                  name="name"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  variant="outlined"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                 <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobile"
                  variant="outlined"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
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

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  startIcon={<UserPlus size={20} />}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Already have an account?{' '}
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
        </Paper>
      </Container>
    </Box>
  );
}
