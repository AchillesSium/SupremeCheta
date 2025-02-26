import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Rating,
  Tooltip,
  Button,
} from '@mui/material';
import {
  MoreHoriz,
  TrendingUp,
  ShoppingCart,
  Favorite,
  LocalShipping,
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
    theme.palette.background.paper,
    0.95
  )} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(
    theme.palette.background.paper,
    0.85
  )} 100%)`,
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
    '& .product-actions': {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
}));

const ProductActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.95)}, transparent)`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transform: 'translateY(100%)',
  opacity: 0,
  transition: 'transform 0.3s, opacity 0.3s',
}));

const StockChip = styled(Chip)(({ theme, instock }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: instock
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.error.main, 0.1),
  color: instock ? theme.palette.success.main : theme.palette.error.main,
  border: `1px solid ${instock ? theme.palette.success.main : theme.palette.error.main}`,
  backdropFilter: 'blur(4px)',
}));

const products = [
  {
    id: 1,
    name: 'Nike Air Max 270',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    price: 199.99,
    rating: 4.8,
    reviews: 234,
    sales: 1289,
    growth: 12.5,
    inStock: true,
    shipping: '2-3 days',
    category: 'Footwear',
  },
  {
    id: 2,
    name: 'MacBook Pro M2',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    price: 1299.99,
    rating: 4.9,
    reviews: 456,
    sales: 892,
    growth: 8.7,
    inStock: true,
    shipping: '3-5 days',
    category: 'Electronics',
  },
  {
    id: 3,
    name: 'Sony WH-1000XM4',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    price: 349.99,
    rating: 4.7,
    reviews: 178,
    sales: 567,
    growth: -2.3,
    inStock: false,
    shipping: '4-6 days',
    category: 'Audio',
  },
  {
    id: 4,
    name: 'Samsung QLED 4K TV',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80',
    price: 899.99,
    rating: 4.6,
    reviews: 123,
    sales: 345,
    growth: 5.8,
    inStock: true,
    shipping: '5-7 days',
    category: 'Electronics',
  },
];

const TopProducts = () => {
  const theme = useTheme();

  return (
    <StyledBox>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Top Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Best selling products this month
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHoriz />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 3,
        }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} elevation={0}>
            <CardMedia
              component="img"
              height="200"
              image={product.image}
              alt={product.name}
              sx={{
                objectFit: 'cover',
                transform: 'scale(1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
            <StockChip
              label={product.inStock ? 'In Stock' : 'Out of Stock'}
              instock={product.inStock ? 1 : 0}
              size="small"
            />
            <CardContent sx={{ pt: 2, pb: 7 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {product.category}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {product.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Rating value={product.rating} precision={0.1} size="small" readOnly />
                <Typography variant="caption" color="text.secondary">
                  ({product.reviews})
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${product.price.toLocaleString()}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp
                    sx={{
                      fontSize: 16,
                      color: product.growth >= 0 ? 'success.main' : 'error.main',
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={product.growth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 600 }}
                  >
                    {product.growth > 0 ? '+' : ''}
                    {product.growth}%
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocalShipping sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {product.shipping}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {product.sales.toLocaleString()} sold
                </Typography>
              </Box>
            </CardContent>
            <ProductActions className="product-actions">
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.9),
                  '&:hover': {
                    bgcolor: theme.palette.primary.main,
                  },
                }}
              >
                Add to Cart
              </Button>
              <IconButton
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <Favorite />
              </IconButton>
            </ProductActions>
          </ProductCard>
        ))}
      </Box>
    </StyledBox>
  );
};

export default TopProducts;