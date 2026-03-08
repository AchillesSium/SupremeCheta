import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CircularProgress, Container } from '@mui/material';
import { getProduct } from './productApi';
import AddEditProductPage from './AddEditProductPage';

const EditProductWrapper = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
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

  return <AddEditProductPage mode="edit" product={data?.data} />;
};

export default EditProductWrapper;