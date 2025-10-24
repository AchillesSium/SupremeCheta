import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';

const AddBrandPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // { brand }
  const editingBrand = state?.brand || null;
  const isEdit = Boolean(editingBrand?._id);

  const [name, setName] = useState(editingBrand?.name || '');
  const [description, setDescription] = useState(editingBrand?.description || '');

  // Logo file + preview (logo is optional when editing, required when creating)
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    editingBrand?.logoUrl || editingBrand?.logo || ''
  );

  // Optional: assign categories to brand
  const initialCategories = useMemo(() => {
    const cats = editingBrand?.categories || [];
    return cats.map((c) => (typeof c === 'object' ? c._id : c)).filter(Boolean);
  }, [editingBrand]);
  const [categoryIds, setCategoryIds] = useState(initialCategories);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [catError, setCatError] = useState('');
  const [catMenuOpen, setCatMenuOpen] = useState(false); // <-- controls dropdown open/close

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attachCategories, setAttachCategories] = useState(categoryIds.length > 0);

  useEffect(() => {
    if (!attachCategories) return;
    (async () => {
      setLoadingCategories(true);
      setCatError('');
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (!res.ok) throw new Error('Failed to load categories');
        const data = await res.json();
        const arr = Array.isArray(data.categories) ? data.categories : [];
        arr.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(arr);
      } catch (e) {
        setCatError(e.message || 'Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, [attachCategories]);

  const onPickLogo = (e) => {
    const file = e.target.files?.[0];
    setLogoFile(file || null);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(editingBrand?.logoUrl || editingBrand?.logo || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const url = isEdit
      ? `${API_BASE_URL}/brands/${editingBrand._id}`
      : `${API_BASE_URL}/brands`;
    const method = isEdit ? 'PUT' : 'POST';

    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    if (attachCategories && categoryIds.length) {
      categoryIds.forEach((id) => form.append('categories', id));
    }
    if (logoFile) {
      form.append('logo', logoFile);
    }

    try {
      const res = await fetch(url, { method, body: form });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0, 160)}…`);
      }
      navigate('/dashboard/brands');
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} brand`);
    } finally {
      setSaving(false);
    }
  };

  const isDisabled =
    saving ||
    !name.trim() ||
    !description.trim() ||
    (!isEdit && !logoFile); // require logo only for new brand

  return (
    <Container maxWidth="sm">
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} mt={4} mb={3}>
        <IconButton onClick={() => navigate('/dashboard/brands')} edge="start" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="600">
          {isEdit ? 'Edit Brand' : 'Add Brand'}
        </Typography>
      </Stack>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          required
        />

        {/* Logo picker + preview */}
        <Box mt={2}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Brand Logo
          </Typography>
          {logoPreview && (
            <Box sx={{ mb: 1 }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img
                src={logoPreview}
                style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8 }}
              />
            </Box>
          )}
          <Button variant="outlined" component="label">
            {logoFile ? 'Change Logo' : (logoPreview ? 'Replace Logo' : 'Upload Logo')}
            <input
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={onPickLogo}
            />
          </Button>
          {!isEdit && !logoFile && (
            <FormHelperText sx={{ ml: 1, mt: 0.5 }}>
              Logo is required for new brands
            </FormHelperText>
          )}
        </Box>

        {/* Attach categories */}
        <FormControlLabel
          control={
            <Checkbox
              checked={attachCategories}
              onChange={(e) => {
                const checked = e.target.checked;
                setAttachCategories(checked);
                if (!checked) setCategoryIds([]);
              }}
            />
          }
          label="Assign to categories"
          sx={{ mt: 2 }}
        />

        {attachCategories && (
          <FormControl
            fullWidth
            margin="normal"
            disabled={loadingCategories || !!catError}
          >
            <InputLabel id="brand-categories-label">Categories</InputLabel>
            <Select
              labelId="brand-categories-label"
              label="Categories"
              multiple
              value={categoryIds}
              onChange={(e) => setCategoryIds(e.target.value)}
              input={<OutlinedInput label="Categories" />}
              open={catMenuOpen}
              onOpen={() => setCatMenuOpen(true)}
              onClose={() => setCatMenuOpen(false)}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 360 },
                },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const cat = categories.find((c) => c._id === id);
                    return <Chip key={id} label={cat?.name || id} />;
                  })}
                </Box>
              )}
            >
              {loadingCategories && (
                <MenuItem disabled>
                  <CircularProgress size={18} sx={{ mr: 1 }} /> Loading…
                </MenuItem>
              )}
              {catError && <MenuItem disabled>Error loading categories</MenuItem>}
              {!loadingCategories &&
                !catError &&
                categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    <Checkbox checked={categoryIds.indexOf(c._id) > -1} sx={{ mr: 1 }} />
                    {c.name}
                  </MenuItem>
                ))}

              {/* Sticky footer with Done button */}
              <MenuItem
                disableRipple
                disableTouchRipple
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  bgcolor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  py: 1,
                }}
              >
                <Box sx={{ width: '100%', textAlign: 'right' }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setCatMenuOpen(false)}
                  >
                    Done
                  </Button>
                </Box>
              </MenuItem>
            </Select>
            {/* Categories optional → no error text */}
          </FormControl>
        )}

        {error && (
          <Typography color="error" mt={1}>
            {error}
          </Typography>
        )}

        <Box mt={3} display="flex" gap={2}>
          <Button type="submit" variant="contained" disabled={isDisabled}>
            {saving ? (isEdit ? 'Updating…' : 'Saving…') : isEdit ? 'Update' : 'Save'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/dashboard/brands')}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AddBrandPage;
