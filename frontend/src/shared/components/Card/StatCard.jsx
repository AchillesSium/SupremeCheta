import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const StatCard = ({ title, value, increase, icon, color, subtitle, trend }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(color, 0.1)}`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.25)}`,
        }
      }}
    >
      <CardContent sx={{ position: 'relative', p: 3 }}>
        <Box 
          sx={{ 
            position: 'absolute',
            top: 16,
            right: 16,
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            backgroundColor: alpha(color, 0.12),
            color: color,
          }}
        >
          {icon}
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 0.5,
            color: theme.palette.text.secondary,
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2,
            color: theme.palette.text.primary,
            fontWeight: 600,
            letterSpacing: '-0.5px'
          }}
        >
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              bgcolor: trend === 'up' ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.error.main, 0.12),
              color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
              py: 0.5,
              px: 1,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {trend === 'up' ? <ArrowUpward sx={{ fontSize: 16 }} /> : <ArrowDownward sx={{ fontSize: 16 }} />}
            {increase}
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
