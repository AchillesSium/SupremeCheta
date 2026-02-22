import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from './productApi';
import AddEditProductPage from './AddEditProductPage';

const ProductDetailsPage = () => {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Container sx={{ mt: 3 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 3 }}>
        <Typography color="error">{error?.message || 'Failed to load product'}</Typography>
      </Container>
    );
  }

  const product = data?.data;
  return <AddEditProductPage mode="edit" product={product} />;
};

export default ProductDetailsPage;
