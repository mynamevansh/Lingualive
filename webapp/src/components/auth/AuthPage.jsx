import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Language,
  Security,
  Speed
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    rememberMe: false,
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Call onLogin to set authentication state
      if (onLogin) {
        onLogin(formData);
      }
    }, 2000);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Simulate Google auth
    setTimeout(() => {
      setIsLoading(false);
      
      // Call onLogin to set authentication state
      if (onLogin) {
        onLogin({ email: 'user@gmail.com', provider: 'google' });
      }
    }, 1500);
  };

  const features = [
    {
      icon: <Language sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Real-Time Translation',
      description: 'Instant translation in 100+ languages'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Privacy First',
      description: 'Your data stays secure and private'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Lightning Fast',
      description: 'Sub-100ms translation latency'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', py: 4, zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Branding */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ color: 'white', mb: 4 }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  LinguaLive
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Break language barriers with AI-powered real-time translation
                </Typography>
                
                {/* Features */}
                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ mr: 2 }}>
                          {React.cloneElement(feature.icon, { sx: { fontSize: 40, color: 'white' } })}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </Grid>

          {/* Right Side - Auth Form */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  maxWidth: 480,
                  mx: 'auto',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {isLogin ? 'Welcome Back' : 'Join LinguaLive'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isLogin 
                      ? 'Sign in to continue to your account' 
                      : 'Create your account to start translating'
                    }
                  </Typography>
                </Box>

                {/* Google Sign In */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<Google />}
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  sx={{
                    mb: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'grey.400',
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  Continue with Google
                </Button>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    or {isLogin ? 'sign in' : 'sign up'} with email
                  </Typography>
                </Divider>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange('firstName')}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        disabled={isLoading}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange('lastName')}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        disabled={isLoading}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={isLoading}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': { borderRadius: 2 }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': { borderRadius: 2 }
                    }}
                  />

                  {!isLogin && (
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      disabled={isLoading}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  )}

                  {/* Form Options */}
                  <Box sx={{ mb: 3 }}>
                    {isLogin ? (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.rememberMe}
                              onChange={handleInputChange('rememberMe')}
                              disabled={isLoading}
                            />
                          }
                          label="Remember me"
                        />
                        <Link
                          component="button"
                          type="button"
                          variant="body2"
                          onClick={() => console.log('Forgot password')}
                          sx={{ textDecoration: 'none' }}
                        >
                          Forgot password?
                        </Link>
                      </Box>
                    ) : (
                      <>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.agreeToTerms}
                              onChange={handleInputChange('agreeToTerms')}
                              disabled={isLoading}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              I agree to the{' '}
                              <Link href="#" sx={{ textDecoration: 'none' }}>
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link href="#" sx={{ textDecoration: 'none' }}>
                                Privacy Policy
                              </Link>
                            </Typography>
                          }
                        />
                        {errors.agreeToTerms && (
                          <Alert severity="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
                            {errors.agreeToTerms}
                          </Alert>
                        )}
                      </>
                    )}
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      mb: 3,
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0, #1976d2)'
                      }
                    }}
                  >
                    {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                      <Link
                        component="button"
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        sx={{ 
                          textDecoration: 'none',
                          fontWeight: 600,
                          color: 'primary.main'
                        }}
                      >
                        {isLogin ? 'Sign up' : 'Sign in'}
                      </Link>
                    </Typography>
                  </Box>
                </form>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AuthPage;