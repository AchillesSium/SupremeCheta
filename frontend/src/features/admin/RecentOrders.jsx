import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  MoreVert, 
  CheckCircle, 
  Pending, 
  LocalShipping,
  AccessTime
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

const orders = [
  {
    id: '#ORD-001',
    customer: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/40?img=1',
    },
    product: 'Nike Air Max',
    amount: '$230.00',
    status: 'Delivered',
    date: '2024-02-25',
    payment: 'Credit Card',
  },
  {
    id: '#ORD-002',
    customer: {
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/40?img=2',
    },
    product: 'Adidas Ultra Boost',
    amount: '$180.00',
    status: 'Processing',
    date: '2024-02-24',
    payment: 'PayPal',
  },
  {
    id: '#ORD-003',
    customer: {
      name: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/40?img=3',
    },
    product: 'Puma RS-X',
    amount: '$150.00',
    status: 'Pending',
    date: '2024-02-24',
    payment: 'Apple Pay',
  },
  {
    id: '#ORD-004',
    customer: {
      name: 'Sarah Wilson',
      avatar: 'https://i.pravatar.cc/40?img=4',
    },
    product: 'Nike React',
    amount: '$200.00',
    status: 'Delivered',
    date: '2024-02-23',
    payment: 'Credit Card',
  },
  {
    id: '#ORD-005',
    customer: {
      name: 'Tom Brown',
      avatar: 'https://i.pravatar.cc/40?img=5',
    },
    product: 'Adidas NMD',
    amount: '$190.00',
    status: 'Processing',
    date: '2024-02-23',
    payment: 'Google Pay',
  },
];

const getStatusConfig = (status, theme) => {
  const configs = {
    delivered: {
      color: theme.palette.success.main,
      background: alpha(theme.palette.success.main, 0.12),
      icon: <CheckCircle fontSize="small" />,
      label: 'Delivered'
    },
    processing: {
      color: theme.palette.info.main,
      background: alpha(theme.palette.info.main, 0.12),
      icon: <LocalShipping fontSize="small" />,
      label: 'Processing'
    },
    pending: {
      color: theme.palette.warning.main,
      background: alpha(theme.palette.warning.main, 0.12),
      icon: <AccessTime fontSize="small" />,
      label: 'Pending'
    },
    cancelled: {
      color: theme.palette.error.main,
      background: alpha(theme.palette.error.main, 0.12),
      icon: <Pending fontSize="small" />,
      label: 'Cancelled'
    }
  };
  return configs[status.toLowerCase()] || configs.pending;
};

const RecentOrders = () => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Recent Orders (24 hours)
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status, theme);
            return (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {order.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={order.customer.avatar} sx={{ width: 32, height: 32 }} />
                    <Typography variant="body2">{order.customer.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.product}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {order.amount}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={statusConfig.icon}
                    label={statusConfig.label}
                    size="small"
                    sx={{
                      color: statusConfig.color,
                      bgcolor: statusConfig.background,
                      '& .MuiChip-icon': {
                        color: 'inherit'
                      },
                      fontWeight: 600,
                      px: 1
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.payment}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="More options">
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default RecentOrders;