import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProduct, updateProduct } from './productApi';
import { getAllCategories } from '../category/categoryApi';
import { getAllBrands } from '../brand/brandApi';

const emptySpec = { name: '', value: '' };

const AddEditProductPage = ({ mode = 'create', product = null }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isEdit = mode === 'edit' && product?._id;

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [status, setStatus] = useState(product?.status || 'draft');
  const [sku, setSku] = useState(product?.inventory?.sku || '');
  const [quantity, setQuantity] = useState(product?.inventory?.quantity ?? 0);

  // Tags still as comma-separated text (unchanged)
  const [tagsText, setTagsText] = useState('');

  // NEW: dropdown data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [lookupError, setLookupError] = useState('');

  // NEW: selected values
  const initialBrandId =
    product?.brand && typeof product.brand === 'object' ? product.brand._id : product?.brand || '';

  const initialCategoryIds = Array.isArray(product?.categories)
    ? product.categories.map((c) => (typeof c === 'object' ? c._id : c)).filter(Boolean)
    : [];

  const [brandId, setBrandId] = useState(initialBrandId);
  const [categoryIds, setCategoryIds] = useState(initialCategoryIds);
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  // Specifications array UI (unchanged)
  const [specs, setSpecs] = useState(() => {
    const s = Array.isArray(product?.specifications) ? product.specifications : [];
    return s.length ? s.map((x) => ({ name: x.name || '', value: x.value || '' })) : [emptySpec];
  });

  // Sync form fields if product changes (edit)
  useEffect(() => {
    if (!isEdit || !product?._id) return;

    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price ?? '');
    setStatus(product.status || 'draft');
    setSku(product.inventory?.sku || '');
    setQuantity(product.inventory?.quantity ?? 0);

    const s = Array.isArray(product.specifications) ? product.specifications : [];
    setSpecs(s.length ? s.map((x) => ({ name: x.name || '', value: x.value || '' })) : [emptySpec]);

    const b = product?.brand && typeof product.brand === 'object' ? product.brand._id : product?.brand || '';
    setBrandId(b || '');

    const cats = Array.isArray(product?.categories)
      ? product.categories.map((c) => (typeof c === 'object' ? c._id : c)).filter(Boolean)
      : [];
    setCategoryIds(cats);
  }, [isEdit, product]);

  // NEW: fetch categories + brands for dropdowns
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoadingLookups(true);
        setLookupError('');

        const [catRes, brandRes] = await Promise.all([
          getAllCategories(),
          getAllBrands({ page: 1, limit: 100, search: '' }),
        ]);

        if (controller.signal.aborted) return;

        const catArr = Array.isArray(catRes?.categories) ? catRes.categories : [];
        catArr.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));

        const brandArr = Array.isArray(brandRes?.brands) ? brandRes.brands : [];
        brandArr.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));

        setCategories(catArr);
        setBrands(brandArr);
      } catch (e) {
        if (!controller.signal.aborted) {
          setLookupError(e.message || 'Failed to load brands/categories');
        }
      } finally {
        if (!controller.signal.aborted) setLoadingLookups(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const payload = useMemo(() => {
    const tags = tagsText
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    const specifications = specs
      .map((s) => ({ name: s.name.trim(), value: s.value.trim() }))
      .filter((s) => s.name && s.value);

    return {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),

      // NEW: dropdown selections
      categories: categoryIds, // array of category ids
      brand: brandId || undefined, // single brand id

      // keep same fields you already send
      tags,
      inventory: undefined, // handled by controller fields
      quantity: Number(quantity),
      sku: sku.trim(),
      specifications,
      status,
    };
  }, [name, description, price, status, sku, quantity, specs, tagsText, categoryIds, brandId]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) return updateProduct(product._id, payload);
      return createProduct(payload);
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ['products'] });

      if (isEdit) {
        await qc.invalidateQueries({ queryKey: ['product', product._id] });
        navigate('/dashboard/products');
      } else {
        const newId = res?.data?._id;
        if (newId) navigate(`/dashboard/products/${newId}`);
        else navigate('/dashboard/products');
      }
    },
  });

  const canSave =
    name.trim() &&
    description.trim() &&
    String(price).trim() !== '' &&
    sku.trim() &&
    categoryIds.length > 0 && // require at least 1 category
    brandId && // require brand
    !Number.isNaN(Number(price)) &&
    !Number.isNaN(Number(quantity));

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton onClick={() => navigate('/dashboard/products')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={600}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </Typography>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {loadingLookups && (
            <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} /> Loading categories & brands…
            </Typography>
          )}
          {lookupError && <Typography color="error">{lookupError}</Typography>}

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            multiline
            rows={4}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="draft">draft</MenuItem>
              <MenuItem value="published">published</MenuItem>
              <MenuItem value="archived">archived</MenuItem>
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
            />
          </Stack>

          <Divider />

          {/* NEW: Brand dropdown */}
          <FormControl fullWidth required disabled={loadingLookups || !!lookupError}>
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select
              labelId="brand-label"
              label="Brand"
              value={brandId || ''}
              onChange={(e) => setBrandId(e.target.value)}
            >
              {brands.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* NEW: Categories dropdown (multi) */}
          <FormControl fullWidth required disabled={loadingLookups || !!lookupError}>
            <InputLabel id="categories-label">Categories</InputLabel>
            <Select
              labelId="categories-label"
              label="Categories"
              multiple
              value={categoryIds}
              onChange={(e) => setCategoryIds(e.target.value)}
              input={<OutlinedInput label="Categories" />}
              open={catMenuOpen}
              onOpen={() => setCatMenuOpen(true)}
              onClose={() => setCatMenuOpen(false)}
              MenuProps={{
                PaperProps: { sx: { maxHeight: 360 } },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const c = categories.find((x) => x._id === id);
                    return <Chip key={id} label={c?.name || id} />;
                  })}
                </Box>
              )}
            >
              {categories.map((c) => (
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
                  <Button size="small" variant="contained" onClick={() => setCatMenuOpen(false)}>
                    Done
                  </Button>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Divider />

          {/* Tags kept same text input */}
          <Typography variant="subtitle1" fontWeight={600}>
            Tags (comma-separated IDs for demo)
          </Typography>
          <TextField
            placeholder="e.g. 65aa..., 65ab..."
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            fullWidth
          />

          <Divider />

          <Typography variant="subtitle1" fontWeight={600}>
            Specifications
          </Typography>

          {specs.map((s, idx) => (
            <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Name"
                value={s.name}
                onChange={(e) => {
                  const next = specs.slice();
                  next[idx] = { ...next[idx], name: e.target.value };
                  setSpecs(next);
                }}
                fullWidth
              />
              <TextField
                label="Value"
                value={s.value}
                onChange={(e) => {
                  const next = specs.slice();
                  next[idx] = { ...next[idx], value: e.target.value };
                  setSpecs(next);
                }}
                fullWidth
              />

              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (specs.length === 1) return setSpecs([emptySpec]);
                  setSpecs(specs.filter((_, i) => i !== idx));
                }}
              >
                Remove
              </Button>
            </Stack>
          ))}

          <Box>
            <Button variant="outlined" onClick={() => setSpecs([...specs, emptySpec])}>
              Add spec row
            </Button>
          </Box>

          {mutation.isError && (
            <Typography color="error">
              {mutation.error?.message || 'Failed to save product'}
            </Typography>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disabled={!canSave || mutation.isPending || loadingLookups}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CircularProgress size={16} /> Saving…
                </span>
              ) : (
                (isEdit ? 'Update' : 'Create')
              )}
            </Button>

            <Button variant="outlined" onClick={() => navigate('/dashboard/products')}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AddEditProductPage;
