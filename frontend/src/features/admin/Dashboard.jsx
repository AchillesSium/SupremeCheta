import React, { useMemo } from 'react';
import { Grid, Box, IconButton, Typography } from '@mui/material';
import {
  ShoppingCart,
  People,
  Visibility,
  AttachMoney,
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import StatCard from '../../shared/components/Card/StatCard';
import RecentOrders from './RecentOrders';
import RevenueChart from './RevenueChart';
import MonthlyTarget from './MonthlyTarget';
import TopCategories from './TopCategories';
import TrafficSources from './TrafficSources';
import TopProducts from './TopProducts';

const DashboardWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(4),
  },
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const Dashboard = () => {
  const theme = useTheme();

  const stats = useMemo(() => [
    {
      title: 'Total Sales',
      value: '$983,410',
      increase: '+5.4%',
      trend: 'up',
      icon: <AttachMoney />,
      color: theme.palette.primary.main,
      subtitle: 'vs last week'
    },
    {
      title: 'Total Orders',
      value: '58,375',
      increase: '-2.8%',
      trend: 'down',
      icon: <ShoppingCart />,
      color: theme.palette.error.main,
      subtitle: 'vs last week'
    },
    {
      title: 'Total Visitors',
      value: '237,782',
      increase: '+8.02%',
      trend: 'up',
      icon: <Visibility />,
      color: theme.palette.success.main,
      subtitle: 'vs last month'
    },
  ], [theme]);

  return (
    <DashboardWrapper>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}

        {/* Revenue Chart and Monthly Target */}
        <Grid item xs={12} md={8}>
          <RevenueChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <MonthlyTarget />
        </Grid>

        {/* Top Categories and Traffic Sources */}
        <Grid item xs={12} md={6}>
          <TopCategories />
        </Grid>
        <Grid item xs={12} md={6}>
          <TrafficSources />
        </Grid>

        {/* Top Products */}
        <Grid item xs={12}>
          <TopProducts />
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <RecentOrders />
        </Grid>
      </Grid>
    </DashboardWrapper>
  );
};

export default Dashboard;
