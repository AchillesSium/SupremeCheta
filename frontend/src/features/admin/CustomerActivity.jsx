import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
} from '@mui/material';

const activities = [
  {
    user: 'John Doe',
    action: 'placed an order',
    time: '2 minutes ago',
    amount: '$156.00',
  },
  {
    user: 'Jane Smith',
    action: 'added items to cart',
    time: '5 minutes ago',
    amount: '$89.99',
  },
  {
    user: 'Mike Johnson',
    action: 'completed checkout',
    time: '10 minutes ago',
    amount: '$245.50',
  },
  {
    user: 'Sarah Wilson',
    action: 'wrote a review',
    time: '15 minutes ago',
  },
  {
    user: 'Tom Brown',
    action: 'subscribed to newsletter',
    time: '20 minutes ago',
  },
];

const CustomerActivity = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customer Activity
      </Typography>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {activities.map((activity, index) => (
          <ListItem
            key={index}
            alignItems="flex-start"
            sx={{
              borderBottom: index < activities.length - 1 ? 1 : 0,
              borderColor: 'divider',
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main }}>
                {activity.user[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.user}
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {activity.action}
                  </Typography>
                  {activity.amount && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="primary"
                      sx={{ ml: 1 }}
                    >
                      ({activity.amount})
                    </Typography>
                  )}
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    {activity.time}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CustomerActivity;