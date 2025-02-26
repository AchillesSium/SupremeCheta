import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { MoreHoriz, TrendingUp, Circle } from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

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

const SourceItem = styled(Box)(({ theme }) => ({
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

const trafficData = [
  { source: 'Direct', value: 40, previousValue: 35, color: '#FF6B6B' },
  { source: 'Organic', value: 30, previousValue: 28, color: '#4ECDC4' },
  { source: 'Social', value: 15, previousValue: 12, color: '#45B7D1' },
  { source: 'Referral', value: 10, previousValue: 15, color: '#96CEB4' },
  { source: 'Email', value: 5, previousValue: 10, color: '#7367F0' },
];

const CustomBar = ({ x, y, width, height, fill }) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={4}
        ry={4}
      />
    </g>
  );
};

const TrafficSources = () => {
  const theme = useTheme();

  const getGrowthPercentage = (current, previous) => {
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  return (
    <StyledBox>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Traffic Sources
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Where your visitors come from
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHoriz />
        </IconButton>
      </Box>

      <Box sx={{ height: 200, width: '100%', mb: 3 }}>
        <ResponsiveContainer>
          <BarChart data={trafficData} barSize={24}>
            <XAxis
              dataKey="source"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <Bar
              dataKey="value"
              shape={<CustomBar />}
            >
              {trafficData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box>
        {trafficData.map((item, index) => (
          <SourceItem key={index}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Circle sx={{ color: item.color, fontSize: 10 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.source}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.value}% of total traffic
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp
                sx={{
                  fontSize: 16,
                  color:
                    item.value >= item.previousValue
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                }}
              />
              <Typography
                variant="caption"
                color={
                  item.value >= item.previousValue
                    ? 'success.main'
                    : 'error.main'
                }
                sx={{ fontWeight: 600 }}
              >
                {getGrowthPercentage(item.value, item.previousValue)}%
              </Typography>
            </Box>
          </SourceItem>
        ))}
      </Box>
    </StyledBox>
  );
};

export default TrafficSources;
