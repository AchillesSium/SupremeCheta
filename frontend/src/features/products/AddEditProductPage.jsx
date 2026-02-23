// src/features/product/AddEditProductPage.jsx
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

import {
  createProduct,
  updateProduct,
  createOrGetProductTag,     // POST /api/products/tags
  updateProductTagProductId, // PUT  /api/products/tags/:tagId   (attach product_id)
  detachProductFromTag,      // ✅ DELETE /api/products/tags/:tagId/product/:productId
} from './productApi';

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

  // Lookups
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [lookupError, setLookupError] = useState('');

  // Selected values
  const initialBrandId =
    product?.brand && typeof product.brand === 'object' ? product.brand._id : product?.brand || '';

  const initialCategoryIds = Array.isArray(product?.categories)
    ? product.categories.map((c) => (typeof c === 'object' ? c._id : c)).filter(Boolean)
    : [];

  const [brandId, setBrandId] = useState(initialBrandId);
  const [categoryIds, setCategoryIds] = useState(initialCategoryIds);
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  // Specs UI
  const [specs, setSpecs] = useState(() => {
    const s = Array.isArray(product?.specifications) ? product.specifications : [];
    return s.length ? s.map((x) => ({ name: x.name || '', value: x.value || '' })) : [emptySpec];
  });

  // ----------------------------
  // TAGS UI: input + add + chips
  // ----------------------------
  const [tagInput, setTagInput] = useState('');
  const [tagItems, setTagItems] = useState(() => {
    const t = Array.isArray(product?.tags) ? product.tags : [];
    return t
      .map((x) => {
        const id = typeof x === 'object' ? (x._id || x.id) : x;
        const tagName = typeof x === 'object' ? (x.tag_name || x.name || '') : '';
        return id ? { _id: id, name: tagName } : null;
      })
      .filter(Boolean);
  });

  const [tagError, setTagError] = useState('');
  const [tagAdding, setTagAdding] = useState(false);
  const [tagDeletingIds, setTagDeletingIds] = useState(() => new Set());

  const normalizedTagInput = useMemo(() => tagInput.trim().toLowerCase(), [tagInput]);
  const canAddTag = !!normalizedTagInput && !tagAdding;

  // product id: in edit mode we have product._id, in create mode product doesn't exist yet
  const productIdForDetach = isEdit ? product?._id : null;

  const handleAddTag = async () => {
    const tagName = normalizedTagInput;
    if (!tagName) return;

    // prevent duplicates (by name)
    const exists = tagItems.some((t) => (t.name || '').toLowerCase() === tagName);
    if (exists) {
      setTagInput('');
      return;
    }

    try {
      setTagAdding(true);
      setTagError('');

      // product_id optional in your API
      const res = await createOrGetProductTag({
        tag_name: tagName,
        // If you WANT to attach immediately in edit mode, you can pass product_id here:
        // product_id: productIdForDetach || undefined,
      });

      const id = res?.data?._id || res?.data?.id;
      const apiName = res?.data?.tag_name || res?.data?.name || tagName;

      if (!id) throw new Error('Tag created but no tag id returned.');

      setTagItems((prev) => [...prev, { _id: id, name: apiName }]);
      setTagInput('');
    } catch (e) {
      setTagError(e?.message || 'Failed to add tag');
    } finally {
      setTagAdding(false);
    }
  };

  const handleRemoveTag = async (tagId) => {
    // Optimistically remove from UI
    const removed = tagItems.find((t) => t._id === tagId);
    setTagItems((prev) => prev.filter((t) => t._id !== tagId));

    // If product id exists (edit mode), call backend to detach
    if (!productIdForDetach) return;

    try {
      setTagError('');
      setTagDeletingIds((prev) => {
        const next = new Set(prev);
        next.add(tagId);
        return next;
      });

      await detachProductFromTag(tagId, productIdForDetach);

      // refresh product cache if you have it
      await qc.invalidateQueries({ queryKey: ['product', productIdForDetach] });
    } catch (e) {
      // rollback on failure
      setTagItems((prev) => (removed ? [...prev, removed] : prev));
      setTagError(e?.message || 'Failed to remove tag from product');
    } finally {
      setTagDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(tagId);
        return next;
      });
    }
  };

  // Sync on edit
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

    const b =
      product?.brand && typeof product.brand === 'object' ? product.brand._id : product?.brand || '';
    setBrandId(b || '');

    const cats = Array.isArray(product?.categories)
      ? product.categories.map((c) => (typeof c === 'object' ? c._id : c)).filter(Boolean)
      : [];
    setCategoryIds(cats);

    // sync tags
    const t = Array.isArray(product?.tags) ? product.tags : [];
    const mappedTags = t
      .map((x) => {
        const id = typeof x === 'object' ? (x._id || x.id) : x;
        const tagName = typeof x === 'object' ? (x.tag_name || x.name || '') : '';
        return id ? { _id: id, name: tagName } : null;
      })
      .filter(Boolean);
    setTagItems(mappedTags);
  }, [isEdit, product]);

  // Fetch categories + brands
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

  const basePayload = useMemo(() => {
    const specifications = specs
      .map((s) => ({ name: s.name.trim(), value: s.value.trim() }))
      .filter((s) => s.name && s.value);

    const tagIds = tagItems.map((t) => t._id).filter(Boolean);

    return {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),

      categories: categoryIds,
      brand: brandId || undefined,

      // TAG IDS gathered during add-tag calls
      tags: tagIds,

      quantity: Number(quantity),
      sku: sku.trim(),
      specifications,
      status,
    };
  }, [name, description, price, status, sku, quantity, specs, categoryIds, brandId, tagItems]);

  const mutation = useMutation({
    mutationFn: async () => {
      // 1) Create or Update product first
      const productRes = isEdit
        ? await updateProduct(product._id, basePayload)
        : await createProduct(basePayload);
  
      const productId =
        (isEdit ? product?._id : null) ||
        productRes?.data?._id ||
        productRes?.data?.id;
  
      if (!productId) return productRes;
  
      // 2) Attach product_id to each selected tag (for BOTH create & update)
      const tagIds = tagItems.map((t) => t._id).filter(Boolean);
  
      if (tagIds.length) {
        await Promise.all(
          tagIds.map((tagId) => updateProductTagProductId(tagId, { product_id: productId }))
        );
      }
  
      return productRes;
    },
  
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ['products'] });
  
      const productId = isEdit
        ? product?._id
        : res?.data?._id || res?.data?.id;
  
      if (isEdit) {
        await qc.invalidateQueries({ queryKey: ['product', productId] });
        navigate('/dashboard/products');
      } else {
        if (productId) navigate(`/dashboard/products/${productId}`);
        else navigate('/dashboard/products');
      }
    },
  });

  const canSave =
    name.trim() &&
    description.trim() &&
    String(price).trim() !== '' &&
    sku.trim() &&
    categoryIds.length > 0 &&
    brandId &&
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
              MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
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

          {/* ---------------- */}
          {/* TAGS (new UI)    */}
          {/* ---------------- */}
          <Typography variant="subtitle1" fontWeight={600}>
            Tags
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Tag"
              placeholder="e.g. shoes"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              fullWidth
              disabled={tagAdding}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (canAddTag) handleAddTag();
                }
              }}
            />

            <Button
              variant="contained"
              onClick={handleAddTag}
              disabled={!canAddTag}
              sx={{ minWidth: 120 }}
            >
              {tagAdding ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CircularProgress size={16} /> Adding…
                </span>
              ) : (
                'Add'
              )}
            </Button>
          </Stack>

          {tagError && <Typography color="error">{tagError}</Typography>}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {tagItems.map((t) => {
              const deleting = tagDeletingIds.has(t._id);
              return (
                <Chip
                  key={t._id}
                  label={t.name || t._id}
                  onDelete={deleting ? undefined : () => handleRemoveTag(t._id)}
                  variant="outlined"
                  sx={{ borderRadius: 999, opacity: deleting ? 0.6 : 1 }}
                  deleteIcon={
                    deleting ? (
                      <CircularProgress size={16} />
                    ) : undefined
                  }
                />
              );
            })}
          </Box>

          <Divider />

          <Typography variant="subtitle1" fontWeight={600}>
            Specifications
          </Typography>

          {specs.map((s, idx) => (
            <Stack
              key={idx}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center"
            >
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
              ) : isEdit ? (
                'Update'
              ) : (
                'Create'
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