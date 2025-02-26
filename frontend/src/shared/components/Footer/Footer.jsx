import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Copyright,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Supreme Cheta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your Ultimate Multi-Vendor E-Commerce Solution
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <Facebook />
              </IconButton>
              <IconButton
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <Twitter />
              </IconButton>
              <IconButton
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <Instagram />
              </IconButton>
              <IconButton
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/about" color="inherit" display="block" sx={{ mb: 1 }}>
              About Us
            </Link>
            <Link href="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
              Contact
            </Link>
            <Link href="/blog" color="inherit" display="block" sx={{ mb: 1 }}>
              Blog
            </Link>
            <Link href="/careers" color="inherit" display="block">
              Careers
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Link href="/help" color="inherit" display="block" sx={{ mb: 1 }}>
              Help Center
            </Link>
            <Link href="/terms" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
            <Link href="/privacy" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link href="/faq" color="inherit" display="block">
              FAQ
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              1234 Market Street
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Suite 456
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              San Francisco, CA 94103
            </Typography>
            <Typography variant="body2" color="text.secondary">
              support@supremecheta.com
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <Copyright sx={{ fontSize: 'inherit', mr: 1 }} />
            {year} Supreme Cheta. All rights reserved.
          </Typography>
          <Box>
            <Link
              href="/terms"
              color="inherit"
              sx={{ mr: 2, fontSize: '0.875rem' }}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              color="inherit"
              sx={{ mr: 2, fontSize: '0.875rem' }}
            >
              Privacy
            </Link>
            <Link href="/cookies" color="inherit" sx={{ fontSize: '0.875rem' }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
