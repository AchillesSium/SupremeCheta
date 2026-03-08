// src/features/product/ProductDetailsPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  CircularProgress,
  Typography,
  Paper,
  Box,
  Stack,
  Button,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProduct, deleteProduct } from './productApi';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  const handleDelete = async () => {
    const ok = window.confirm('Are you sure you want to delete this product?');
    if (!ok) return;

    try {
      await deleteProduct(id);
      await qc.invalidateQueries({ queryKey: ['products'] });
      navigate('/dashboard/products');
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">
          {error?.message || 'Failed to load product'}
        </Typography>
      </Container>
    );
  }

  const product = data?.data;
  if (!product) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* HEADER */}
        <Stack spacing={2} mb={3}>
          {/* Back Button */}
          <Box>
            <IconButton
              onClick={() => navigate('/dashboard/products')}
              sx={{ mb: 1 }}
            >
              <ArrowBackIcon />
              <Typography variant="h5" fontWeight={600}>
                {' Products'}
              </Typography>
            </IconButton>
          </Box>

          {/* Title + Actions */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Typography variant="h4" fontWeight={700}>
              {product.name}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={() => navigate(`/dashboard/products/${id}/edit`)}
              >
                Edit
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* BASIC INFO */}
        <Stack spacing={2}>
          <Box>
            <Typography fontWeight={700} sx={{ mb: 1 }}>Description</Typography>
            <Box
              sx={{ '& p': { m: 0 }, '& ul': { m: 0, pl: 3 }, '& ol': { m: 0, pl: 3 } }}
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />
          </Box>

          <Typography>
            <strong>Price:</strong> {Number(product.price).toFixed(2)}
          </Typography>

          <Typography>
            <strong>Status:</strong>{' '}
            <Chip label={product.status} size="small" />
          </Typography>

          <Typography>
            <strong>SKU:</strong> {product.inventory?.sku || '-'}
          </Typography>

          <Typography>
            <strong>Quantity:</strong> {product.inventory?.quantity ?? 0}
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* BRAND */}
        <Box mb={2}>
          <Typography fontWeight={600}>Brand</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            {product.brand ? (
              <Chip
                label={
                  typeof product.brand === 'object'
                    ? product.brand.name
                    : product.brand
                }
              />
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                No brand assigned
              </Typography>
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* CATEGORIES */}
        <Box mb={2}>
          <Typography fontWeight={600}>Categories</Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {product.categories?.map((c) => (
              <Chip key={c._id} label={c.name} />
            ))}
          </Stack>
        </Box>

        {/* TAGS */}
        <Box mb={2}>
          <Typography fontWeight={600}>Tags</Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {product.tags?.map((t) => (
              <Chip key={t._id} label={t.tag_name || t.name} variant="outlined" />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* SPECIFICATIONS */}
        <Box mb={2}>
          <Typography fontWeight={600}>Specifications</Typography>
          <Stack spacing={1} mt={1}>
            {product.specifications?.map((s, i) => (
              <Typography key={i}>
                • <strong>{s.name}:</strong> {s.value}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* MEDIA */}
        <Box>
          <Typography fontWeight={600}>Media</Typography>

          <Box
            mt={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {[...(product.imagesMedia || []), ...(product.videosMedia || [])].map((m) => (
              <Box key={m._id}>
                {m.kind === 'image' ? (
                  <img
                    src={m.url}
                    alt=""
                    style={{
                      width: '100%',
                      height: 220,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <video
                    src={m.url}
                    controls
                    style={{
                      width: '100%',
                      height: 220,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                )}

                {m.isPrimary && (
                  <Chip
                    label="Primary"
                    size="small"
                    color="success"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductDetailsPage;