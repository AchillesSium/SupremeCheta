import React , {useState} from 'react';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Alert,
    Paper
} from '@mui/material';

import LockedOutlinedIcon from '@mui/icons-material/LockedOutlined';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); 

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // we will add actual login logic here
        setError('');
        console.log("Login attempt with: ",formData);
        setSuccess('Login successful!');
    };
    
    return (
        <Container component="main" maxWidth="xs">
          <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              backgroundColor: 'primary.main', 
              p: 2, 
              borderRadius: '50%', 
              mb: 2 
            }}>
              <LockOutlinedIcon sx={{ color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              Sign in to Supreme Cheta
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
    
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                Sign In
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    };
    
    export default LoginForm;
    