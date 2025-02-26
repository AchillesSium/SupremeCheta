import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

// Sample data - you can replace this with real data from your API
const revenueData = [
  { date: '12 Aug', revenue: 14000, orders: 8000 },
  { date: '13 Aug', revenue: 15500, orders: 9200 },
  { date: '14 Aug', revenue: 14250, orders: 8700 },
  { date: '15 Aug', revenue: 16800, orders: 10500 },
  { date: '16 Aug', revenue: 14900, orders: 9100 },
  { date: '17 Aug', revenue: 15800, orders: 9800 },
  { date: '18 Aug', revenue: 16200, orders: 10000 },
  { date: '19 Aug', revenue: 17000, orders: 10800 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 1,
          boxShadow: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" color="primary">
            Revenue: ${payload[0].value.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="secondary">
            Orders: {payload[1].value.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

const RevenueChart = () => {
  const theme = useTheme();

  return (
    <StyledBox>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Revenue Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last 8 days
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHoriz />
        </IconButton>
      </Box>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart
            data={revenueData}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.palette.secondary.main}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.secondary.main}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: theme.palette.text.secondary }}
              stroke={theme.palette.divider}
            />
            <YAxis
              tick={{ fill: theme.palette.text.secondary }}
              stroke={theme.palette.divider}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={theme.palette.primary.main}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke={theme.palette.secondary.main}
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </StyledBox>
  );
};

export default RevenueChart;
