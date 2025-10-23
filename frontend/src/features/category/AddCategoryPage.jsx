import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  IconButton,
  Stack,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../../config';

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // { category }
  const editingCategory = state?.category || null;
  const isEdit = Boolean(editingCategory?._id);

  const [name, setName] = useState(editingCategory?.name || '');
  const [description, setDescription] = useState(editingCategory?.description || '');

  // Normalize parent id if object or id
  const initialParentId = (() => {
    const p = editingCategory?.parentCategory ?? null;
    if (!p) return '';
    return typeof p === 'object' ? (p._id || '') : p;
  })();

  const [isSubCategory, setIsSubCategory] = useState(Boolean(initialParentId));
  const [parentCategory, setParentCategory] = useState('');
  const [parentOptions, setParentOptions] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [parentLoadError, setParentLoadError] = useState('');

  // NEW: image file + preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editingCategory?.imageUrl || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load parent options whenever subcategory is active OR in edit mode (so we can show/modify parent)
  useEffect(() => {
    const shouldFetch = isSubCategory || isEdit;
    if (!shouldFetch) return;
    (async () => {
      setLoadingParents(true);
      setParentLoadError('');
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (!res.ok) throw new Error('Failed to load categories');

        const data = await res.json();
        const all = Array.isArray(data.categories) ? data.categories : [];
        // Prevent choosing itself as parent
        const filtered = isEdit ? all.filter((c) => c._id !== editingCategory._id) : all;
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        setParentOptions(filtered);
        if (initialParentId) {
          setParentCategory(initialParentId);
        }
      } catch (e) {
        setParentLoadError(e.message || 'Failed to load categories');
      } finally {
        setLoadingParents(false);
      }
    })();
  }, [isSubCategory, initialParentId, isEdit, editingCategory?._id]);

  // NEW: handle file choose + preview (jpeg/png/webp/gif/svg)
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(editingCategory?.imageUrl || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const url = isEdit
      ? `${API_BASE_URL}/categories/${editingCategory._id}`
      : `${API_BASE_URL}/categories`;
    const method = isEdit ? 'PUT' : 'POST';

    // IMPORTANT: use FormData for multipart/form-data
    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    if (isSubCategory && parentCategory) {
      form.append('parentCategory', parentCategory);
    } else {
      // omit parent if not a subcategory (backend treats missing as null)
    }
    if (imageFile) {
      form.append('image', imageFile); // field name must match upload.single('image')
    }

    try {
      const res = await fetch(url, {
        method,
        body: form, // do NOT set Content-Type; browser sets boundary automatically
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0, 160)}…`);
      }

      navigate('/dashboard/categories');
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} category`);
    } finally {
      setSaving(false);
    }
  };

  const isDisabled =
    saving ||
    !name.trim() ||
    !description.trim() ||
    (isSubCategory && !parentCategory) ||
    (!isEdit && !imageFile); // require image for new category

  return (
    <Container maxWidth="sm">
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} mt={4} mb={3}>
        <IconButton onClick={() => navigate('/dashboard/categories')} edge="start" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="600">
          {isEdit ? 'Edit Category' : 'Add Category'}
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

        {/* Image picker + preview */}
        <Box mt={2}>
          <Typography variant="subtitle2" sx={{ mb: 1 }} required>
            Category Image
          </Typography>
          {imagePreview && (
            <Box sx={{ mb: 1 }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img
                src={imagePreview}
                style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8 }}
              />
            </Box>
          )}
          <Button variant="outlined" component="label">
            {imageFile ? 'Change Image' : (imagePreview ? 'Replace Image' : 'Upload Image')}
            <input
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={onPickImage}
            />
          </Button>
        </Box>

        {/* Is Subcategory */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isSubCategory}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsSubCategory(checked);
                if (!checked) setParentCategory('');
              }}
            />
          }
          label="This is a subcategory"
          sx={{ mt: 2 }}
        />

        {/* Parent Category (required if subcategory) */}
        {isSubCategory && (
          <FormControl fullWidth margin="normal" required error={!parentCategory}>
            <InputLabel id="parent-category-label">Parent Category</InputLabel>
            <Select
              labelId="parent-category-label"
              label="Parent Category"
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              disabled={loadingParents || !!parentLoadError}
            >
              {loadingParents && (
                <MenuItem disabled>
                  <CircularProgress size={18} sx={{ mr: 1 }} /> Loading…
                </MenuItem>
              )}
              {parentLoadError && <MenuItem disabled>Error loading categories</MenuItem>}
              {!loadingParents &&
                !parentLoadError &&
                parentOptions.map((opt) => (
                  <MenuItem key={opt._id} value={opt._id}>
                    {opt.name}
                  </MenuItem>
                ))}
            </Select>
            {!parentCategory && <FormHelperText>Parent category is required</FormHelperText>}
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
          <Button variant="outlined" onClick={() => navigate('/dashboard/categories')}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AddCategoryPage;
