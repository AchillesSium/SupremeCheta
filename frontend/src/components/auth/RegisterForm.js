import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useAuth } from '../../providers/AuthProvider';

const RegisterForm = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        address: '',
        phone_number: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            console.log('Attempting registration with:', formData);
            const response = await register(formData);
            console.log(response)
            setSuccess('Registration successful! Redirecting to login...');
            
            // Clear local storage before redirecting
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Use immediate navigation instead of setTimeout
            navigate('/login', { replace: true });
        } catch (err) {
            console.error('Registration error:', err);
            // Extract the error message from the response
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <AccountCircleOutlinedIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Create Account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Box 
                        component="form" 
                        onSubmit={handleSubmit} 
                        sx={{ mt: 1, width: '100%' }}
                        noValidate
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="first_name"
                                    label="First Name"
                                    name="first_name"
                                    autoComplete="given-name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="last_name"
                                    label="Last Name"
                                    name="last_name"
                                    autoComplete="family-name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    inputProps={{
                                        autoCapitalize: 'none'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    inputProps={{
                                        autoCapitalize: 'none'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="address"
                                    label="Address"
                                    name="address"
                                    autoComplete="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="phone_number"
                                    label="Phone Number"
                                    type="tel"
                                    id="phone_number"
                                    autoComplete="tel"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                            disabled={isSubmitting}
                        >
                            Already have an account? Sign In
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default RegisterForm;