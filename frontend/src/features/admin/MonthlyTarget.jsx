import React from 'react';
import { Box, Typography, IconButton, LinearProgress } from '@mui/material';
import { MoreHoriz, TrendingUp, ArrowUpward } from '@mui/icons-material';
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

const ProgressCircle = styled(Box)(({ theme, value }) => ({
  position: 'relative',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: `conic-gradient(${theme.palette.primary.main} ${value}%, transparent ${value}%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    background: theme.palette.background.paper,
  },
}));

const MetricBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  background: alpha(theme.palette.primary.main, 0.04),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const MonthlyTarget = () => {
  const theme = useTheme();
  const targetValue = 3400000;
  const currentValue = 2890000;
  const progressPercentage = Math.round((currentValue / targetValue) * 100);
  const remainingValue = targetValue - currentValue;
  const growthRate = 12.5;

  return (
    <StyledBox>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Monthly Target
          </Typography>
          <Typography variant="body2" color="text.secondary">
            How close are we to the target?
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHoriz />
        </IconButton>
      </Box>

      <Box display="flex" gap={4} mb={3}>
        <Box flex={1}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            ${(currentValue / 1000000).toFixed(2)}M
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            of ${(targetValue / 1000000).toFixed(2)}M target
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              mb: 2,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              },
            }}
          />

          <Box display="flex" gap={2}>
            <MetricBox>
              <TrendingUp color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Growth Rate
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  +{growthRate}%
                </Typography>
              </Box>
            </MetricBox>
            <MetricBox>
              <ArrowUpward color="success" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {progressPercentage}%
                </Typography>
              </Box>
            </MetricBox>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <ProgressCircle value={progressPercentage} />
          <Box
            sx={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {progressPercentage}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completed
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        }}
      >
        <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 600 }}>
          ${(remainingValue / 1000000).toFixed(2)}M more to reach the target
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Keep pushing! You're making great progress.
        </Typography>
      </Box>
    </StyledBox>
  );
};

export default MonthlyTarget;
