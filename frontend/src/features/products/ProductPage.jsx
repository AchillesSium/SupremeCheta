import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  TableContainer,
  Pagination,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { listProducts } from './productApi';

function pickPrimaryOrFirstMedia(product) {
  const images = Array.isArray(product?.imagesMedia) ? product.imagesMedia : [];
  const videos = Array.isArray(product?.videosMedia) ? product.videosMedia : [];
  const media = Array.isArray(product?.media) ? product.media : [];

  const combined = [...images, ...videos];
  const list = combined.length ? combined : media;

  if (!list.length) return null;

  // Prefer primary
  const primary = list.find((m) => m?.isPrimary);
  return primary || list[0];
}

function MediaThumb({ media }) {
  const size = 54;

  if (!media?.url) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          bgcolor: 'grey.100',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          opacity: 0.7,
        }}
      >
        N/A
      </Box>
    );
  }

  const kind = (media?.kind || '').toLowerCase();

  if (kind === 'video') {
    // If you have thumbnailUrl in backend, prefer it:
    if (media.thumbnailUrl) {
      return (
        <Box sx={{ position: 'relative', width: size, height: size }}>
          <img
            src={media.thumbnailUrl}
            alt="video thumbnail"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.12)',
              display: 'block',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              textShadow: '0 1px 6px rgba(0,0,0,0.6)',
            }}
          >
            ▶
          </Box>
        </Box>
      );
    }

    // Fallback: render <video> (can be heavier but works)
    return (
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <video
          src={media.url}
          muted
          playsInline
          preload="metadata"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.12)',
            display: 'block',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
          }}
        >
          ▶
        </Box>
      </Box>
    );
  }

  // image
  return (
    <img
      src={media.url}
      alt="product"
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'block',
      }}
    />
  );
}

const ProductPage = () => {
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryKey = useMemo(() => ['products', { q, page, limit }], [q, page]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey,
    queryFn: () => listProducts({ q, page, limit, sort: '-createdAt' }),
    keepPreviousData: true,
  });

  const items = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0, limit };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
        <Typography variant="h5">Products</Typography>

        <Button variant="contained" onClick={() => navigate('/dashboard/add-product')}>
          Add Product
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            fullWidth
          />
          <Box sx={{ minWidth: 120 }}>
            {isFetching && <Chip size="small" label="Refreshing…" />}
          </Box>
        </Stack>
      </Paper>

      {isLoading && <CircularProgress />}
      {isError && <Typography color="error">{error?.message || 'Failed to load products'}</Typography>}

      {!isLoading && !isError && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={80}>Media</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Qty</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((p) => {
                  const media = pickPrimaryOrFirstMedia(p);

                  return (
                    <TableRow
                      key={p._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/dashboard/products/${p._id}`)}
                    >
                      <TableCell>
                        <MediaThumb media={media} />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>

                      <TableCell align="right">{Number(p.price ?? 0).toFixed(2)}</TableCell>

                      <TableCell>
                        <Chip size="small" label={p.status || 'draft'} variant="outlined" />
                      </TableCell>

                      <TableCell>{p.inventory?.sku || '-'}</TableCell>
                      <TableCell align="right">{p.inventory?.quantity ?? 0}</TableCell>
                    </TableRow>
                  );
                })}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography>No products found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Typography variant="body2">Total: {pagination.total || 0}</Typography>

            <Pagination
              page={pagination.page || page}
              count={pagination.pages || 1}
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default ProductPage;