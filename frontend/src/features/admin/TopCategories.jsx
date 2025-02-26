import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { MoreHoriz, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

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

const CategoryItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const categories = [
  { name: 'Electronics', value: 1300000, growth: 12.5, color: '#FF6B6B' },
  { name: 'Fashion', value: 965000, growth: -2.8, color: '#4ECDC4' },
  { name: 'Home & Garden', value: 740000, growth: 5.4, color: '#45B7D1' },
  { name: 'Beauty', value: 500000, growth: 8.2, color: '#96CEB4' },
];

const CustomLegend = ({ payload }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mt: 2 }}>
      {payload.map((entry, index) => (
        <CategoryItem key={index}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: entry.color,
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {entry.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${(categories[index].value / 1000).toFixed(1)}k
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {categories[index].growth > 0 ? (
              <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              color={categories[index].growth > 0 ? 'success.main' : 'error.main'}
              sx={{ fontWeight: 600 }}
            >
              {Math.abs(categories[index].growth)}%
            </Typography>
          </Box>
        </CategoryItem>
      ))}
    </Box>
  );
};

const TopCategories = () => {
  const theme = useTheme();

  return (
    <StyledBox>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Top Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Performance by category
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHoriz />
        </IconButton>
      </Box>

      <Box sx={{ height: 200, width: '100%' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {categories.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <CustomLegend payload={categories.map(cat => ({ value: cat.name, color: cat.color }))} />
    </StyledBox>
  );
};

export default TopCategories;
