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
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((p) => (
                  <TableRow
                    key={p._id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/products/${p._id}`)}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                    <TableCell sx={{ maxWidth: 360 }} title={p.description}>
                      {p.description?.length > 80 ? p.description.slice(0, 80) + '…' : p.description}
                    </TableCell>
                    <TableCell align="right">{Number(p.price ?? 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={p.status || 'draft'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{p.inventory?.sku || '-'}</TableCell>
                    <TableCell align="right">{p.inventory?.quantity ?? 0}</TableCell>
                  </TableRow>
                ))}

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
            <Typography variant="body2">
              Total: {pagination.total || 0}
            </Typography>

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
