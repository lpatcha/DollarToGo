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
    firstName: '',
    lastName: '',
    phone: '',
    licenseNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: ''
  });
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

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
      const payload: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: role
      };

      if (role === 'DRIVER') {
        payload.driverDetails = {
          licenseNumber: formData.licenseNumber,
          vehicleMake: formData.vehicleMake,
          vehicleModel: formData.vehicleModel,
          vehicleYear: parseInt(formData.vehicleYear),
          vehicleColor: formData.vehicleColor,
          licensePlate: formData.licensePlate
        };
      }

      await api.post('/auth/register', payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              textAlign: 'center'
            }}
          >
            <Stack spacing={4} alignItems="center">
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
                  mb: 2
                }}
              >
                <div style={{ transform: 'scale(1.5)' }}>
                  <UserPlus size={32} />
                </div>
              </Box>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  fontFamily: 'var(--font-outfit)',
                  background: (theme) => `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Check Your Email
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontFamily: 'var(--font-outfit)' }}
              >
                Account created successfully for <b>{formData.email}</b>. 
                Before logging in, you must activate your account by clicking the link we've just sent to your inbox.
              </Typography>

              <Alert severity="info" sx={{ width: '100%', borderRadius: 3, fontFamily: 'var(--font-outfit)' }}>
                Didn't receive the email? Check your spam folder or try re-registering if the email was incorrect.
              </Alert>

              <Button 
                variant="contained" 
                fullWidth 
                href="/login"
                sx={{ 
                  borderRadius: 3, 
                  py: 1.5, 
                  textTransform: 'none', 
                  fontSize: '1rem',
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 700
                }}
              >
                Go to Login
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    variant="outlined"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    variant="outlined"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Stack>
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
                  name="phone"
                  variant="outlined"
                  value={formData.phone}
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

                {role === 'DRIVER' && (
                  <Stack spacing={3}>
                    <Divider sx={{ my: 1 }}>
                      <Typography variant="body2" color="text.secondary">Vehicle & Driver Details</Typography>
                    </Divider>
                    
                    <TextField
                      fullWidth
                      label="Driver License Number"
                      name="licenseNumber"
                      variant="outlined"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="Vehicle Make (e.g., Toyota)"
                        name="vehicleMake"
                        variant="outlined"
                        value={formData.vehicleMake}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                      <TextField
                        fullWidth
                        label="Vehicle Model (e.g., Camry)"
                        name="vehicleModel"
                        variant="outlined"
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="Vehicle Year"
                        name="vehicleYear"
                        variant="outlined"
                        type="number"
                        value={formData.vehicleYear}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                      <TextField
                        fullWidth
                        label="Vehicle Color"
                        name="vehicleColor"
                        variant="outlined"
                        value={formData.vehicleColor}
                        onChange={handleChange}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Stack>

                    <TextField
                      fullWidth
                      label="License Plate Number"
                      name="licensePlate"
                      variant="outlined"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                  </Stack>
                )}

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
