import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Box, Typography, CircularProgress, List, ListItem, ListItemText } from '@mui/material';

const CategoryPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/categories'); // Adjust API endpoint
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                console.log(data)
                setCategories(Array.isArray(data.categories) ? data.categories : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <Container>
            {/* Header Section with "Add Category" button */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
                <Typography variant="h5">Categories</Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/add-category')}>
                    Add New Category
                </Button>
            </Box>

            {/* Loading State */}
            {loading && <CircularProgress />}

            {/* Error Handling */}
            {error && <Typography color="error">{error}</Typography>}

            {/* Category List */}
            {!loading && !error && (
                <List>
                    {categories.map((category) => (
                        <ListItem key={category._id}>
                            <ListItemText primary={category.name} secondary={category.description} />
                        </ListItem>
                    ))}
                </List>
            )}
        </Container>
    );
};

export default CategoryPage;