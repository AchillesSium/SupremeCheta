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
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarIcon from '@mui/icons-material/Star';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import {
  createProduct,
  updateProduct,
  deleteProduct,

  createOrGetProductTag,
  updateProductTagProductId,
  detachProductFromTag,

  uploadProductMedia,
  setPrimaryProductMedia,
  deleteProductMedia,
} from './productApi';

import { getAllCategories } from '../category/categoryApi';
import { getAllBrands } from '../brand/brandApi';

const emptySpec = { name: '', value: '' };

const isImageFile = (file) => (file?.type || '').startsWith('image/');
const isVideoFile = (file) => (file?.type || '').startsWith('video/');

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

  // ✅ Delete product state
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [deleteProductError, setDeleteProductError] = useState('');

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

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
  ];

  // ----------------------------
  // TAGS UI
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

  const productIdForDetach = isEdit ? product?._id : null;

  const handleAddTag = async () => {
    const tagName = normalizedTagInput;
    if (!tagName) return;

    const exists = tagItems.some((t) => (t.name || '').toLowerCase() === tagName);
    if (exists) {
      setTagInput('');
      return;
    }

    try {
      setTagAdding(true);
      setTagError('');

      const res = await createOrGetProductTag({ tag_name: tagName });

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
    const removed = tagItems.find((t) => t._id === tagId);
    setTagItems((prev) => prev.filter((t) => t._id !== tagId));

    if (!productIdForDetach) return;

    try {
      setTagError('');
      setTagDeletingIds((prev) => {
        const next = new Set(prev);
        next.add(tagId);
        return next;
      });

      await detachProductFromTag(tagId, productIdForDetach);
      await qc.invalidateQueries({ queryKey: ['product', productIdForDetach] });
    } catch (e) {
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

  // ----------------------------
  // MEDIA UI
  // ----------------------------
  const [existingMedia, setExistingMedia] = useState(() => {
    const images = Array.isArray(product?.imagesMedia) ? product.imagesMedia : [];
    const videos = Array.isArray(product?.videosMedia) ? product.videosMedia : [];
    const media = Array.isArray(product?.media) ? product.media : [];
    const combined = [...images, ...videos];
    return combined.length ? combined : media;
  });

  const [pendingFiles, setPendingFiles] = useState([]); // File[]

  // store GLOBAL index (backend compares against global i)
  const [pendingPrimaryImageGlobalIdx, setPendingPrimaryImageGlobalIdx] = useState(null);
  const [pendingPrimaryVideoGlobalIdx, setPendingPrimaryVideoGlobalIdx] = useState(null);

  const [mediaError, setMediaError] = useState('');
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaDeletingIds, setMediaDeletingIds] = useState(() => new Set());
  const [mediaPrimarySettingIds, setMediaPrimarySettingIds] = useState(() => new Set());

  const pendingPreviews = useMemo(() => {
    return pendingFiles.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      kind: isImageFile(f) ? 'image' : 'video',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      try {
        pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url));
      } catch {
        /* ignore */
      }
    };
  }, [pendingPreviews]);

  const handlePickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const bad = files.find((f) => !isImageFile(f) && !isVideoFile(f));
    if (bad) {
      setMediaError('Only image/video files are allowed.');
      return;
    }

    setMediaError('');
    setPendingFiles((prev) => [...prev, ...files]);
  };

  const handleRemovePendingFile = (globalIdx) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== globalIdx));

    if (pendingPrimaryImageGlobalIdx === globalIdx) setPendingPrimaryImageGlobalIdx(null);
    if (pendingPrimaryVideoGlobalIdx === globalIdx) setPendingPrimaryVideoGlobalIdx(null);

    if (pendingPrimaryImageGlobalIdx != null && globalIdx < pendingPrimaryImageGlobalIdx) {
      setPendingPrimaryImageGlobalIdx((x) => (x == null ? x : x - 1));
    }
    if (pendingPrimaryVideoGlobalIdx != null && globalIdx < pendingPrimaryVideoGlobalIdx) {
      setPendingPrimaryVideoGlobalIdx((x) => (x == null ? x : x - 1));
    }
  };

  const handleSetPendingPrimary = (globalIdx) => {
    const f = pendingFiles[globalIdx];
    if (!f) return;
    if (isImageFile(f)) setPendingPrimaryImageGlobalIdx(globalIdx);
    if (isVideoFile(f)) setPendingPrimaryVideoGlobalIdx(globalIdx);
  };

  const refreshExistingMediaFromProduct = async (productId) => {
    await qc.invalidateQueries({ queryKey: ['product', productId] });

    const cached = qc.getQueryData(['product', productId]);
    const data = cached?.data || cached;

    const images = Array.isArray(data?.imagesMedia) ? data.imagesMedia : [];
    const videos = Array.isArray(data?.videosMedia) ? data.videosMedia : [];
    const media = Array.isArray(data?.media) ? data.media : [];
    const combined = [...images, ...videos];
    if (combined.length) setExistingMedia(combined);
    else if (media.length) setExistingMedia(media);
  };

  const handleUploadPendingMedia = async (productId) => {
    if (!productId) return;
    if (!pendingFiles.length) return;

    try {
      setMediaUploading(true);
      setMediaError('');

      const fd = new FormData();
      pendingFiles.forEach((f) => fd.append('media', f));

      if (pendingPrimaryImageGlobalIdx != null) {
        fd.append('primaryImageIndex', String(pendingPrimaryImageGlobalIdx));
      }
      if (pendingPrimaryVideoGlobalIdx != null) {
        fd.append('primaryVideoIndex', String(pendingPrimaryVideoGlobalIdx));
      }

      fd.append('sortOrder', '0');

      await uploadProductMedia(productId, fd);

      setPendingFiles([]);
      setPendingPrimaryImageGlobalIdx(null);
      setPendingPrimaryVideoGlobalIdx(null);

      await refreshExistingMediaFromProduct(productId);
    } catch (e) {
      setMediaError(e?.message || 'Failed to upload media');
    } finally {
      setMediaUploading(false);
    }
  };

  const handleDeleteExistingMedia = async (productId, mediaId) => {
    if (!productId || !mediaId) return;
    try {
      setMediaError('');
      setMediaDeletingIds((prev) => new Set(prev).add(mediaId));

      await deleteProductMedia(productId, mediaId);

      setExistingMedia((prev) => prev.filter((m) => (m?._id || m?.id) !== mediaId));
      await refreshExistingMediaFromProduct(productId);
    } catch (e) {
      setMediaError(e?.message || 'Failed to delete media');
    } finally {
      setMediaDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(mediaId);
        return next;
      });
    }
  };

  const handleSetPrimaryExistingMedia = async (productId, mediaId, kind) => {
    if (!productId || !mediaId || !kind) return;
    try {
      setMediaError('');
      setMediaPrimarySettingIds((prev) => new Set(prev).add(mediaId));

      await setPrimaryProductMedia(productId, mediaId, kind);

      setExistingMedia((prev) =>
        prev.map((m) => {
          const mid = m?._id || m?.id;
          if (!mid) return m;
          if ((m?.kind || '').toLowerCase() !== kind) return m;
          return { ...m, isPrimary: mid === mediaId };
        })
      );

      await refreshExistingMediaFromProduct(productId);
    } catch (e) {
      setMediaError(e?.message || 'Failed to set primary media');
    } finally {
      setMediaPrimarySettingIds((prev) => {
        const next = new Set(prev);
        next.delete(mediaId);
        return next;
      });
    }
  };

  // ✅ Delete product handler
  const handleDeleteProduct = async () => {
    if (!isEdit || !product?._id) return;

    const ok = window.confirm('Are you sure you want to delete this product? This cannot be undone.');
    if (!ok) return;

    try {
      setDeletingProduct(true);
      setDeleteProductError('');

      await deleteProduct(product._id);

      await qc.invalidateQueries({ queryKey: ['products'] });
      await qc.invalidateQueries({ queryKey: ['product', product._id] });

      navigate('/dashboard/products');
    } catch (e) {
      setDeleteProductError(e?.message || 'Failed to delete product');
    } finally {
      setDeletingProduct(false);
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

    const t = Array.isArray(product?.tags) ? product.tags : [];
    const mappedTags = t
      .map((x) => {
        const id = typeof x === 'object' ? (x._id || x.id) : x;
        const tagName = typeof x === 'object' ? (x.tag_name || x.name || '') : '';
        return id ? { _id: id, name: tagName } : null;
      })
      .filter(Boolean);
    setTagItems(mappedTags);

    const images = Array.isArray(product?.imagesMedia) ? product.imagesMedia : [];
    const videos = Array.isArray(product?.videosMedia) ? product.videosMedia : [];
    const media = Array.isArray(product?.media) ? product.media : [];
    const combined = [...images, ...videos];
    setExistingMedia(combined.length ? combined : media);
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

      tags: tagIds,

      quantity: Number(quantity),
      sku: sku.trim(),
      specifications,
      status,
    };
  }, [name, description, price, status, sku, quantity, specs, categoryIds, brandId, tagItems]);

  const mutation = useMutation({
    mutationFn: async () => {
      const productRes = isEdit
        ? await updateProduct(product._id, basePayload)
        : await createProduct(basePayload);

      const productId = (isEdit ? product?._id : null) || productRes?.data?._id || productRes?.data?.id;

      if (!productId) return productRes;

      // attach product_id to each tag
      const tagIds = tagItems.map((t) => t._id).filter(Boolean);
      if (tagIds.length) {
        await Promise.all(tagIds.map((tagId) => updateProductTagProductId(tagId, { product_id: productId })));
      }

      // upload pending media after save
      if (pendingFiles.length) {
        await handleUploadPendingMedia(productId);
      }

      return productRes;
    },

    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ['products'] });

      const productId = isEdit ? product?._id : res?.data?._id || res?.data?.id;

      if (isEdit) {
        await qc.invalidateQueries({ queryKey: ['product', productId] });
        navigate('/dashboard/products');
      } else {
        if (productId) navigate(`/dashboard/products/${productId}`);
        else navigate('/dashboard/products');
      }
    },
  });

  const stripHtml = (html) =>
  (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

  const canSave =
    name.trim() &&
    stripHtml(description) &&
    String(price).trim() !== '' &&
    sku.trim() &&
    categoryIds.length > 0 &&
    brandId &&
    !Number.isNaN(Number(price)) &&
    !Number.isNaN(Number(quantity));

  const mediaCanManageExisting = !!(isEdit && product?._id);

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      {/* Header row with delete icon */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate('/dashboard/products')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </Typography>
        </Stack>

        {isEdit && (
          <Tooltip title="Delete product">
            <span>
              <IconButton
                color="error"
                onClick={handleDeleteProduct}
                disabled={deletingProduct || mutation.isPending || mediaUploading}
              >
                {deletingProduct ? <CircularProgress size={18} /> : <DeleteOutlineIcon />}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>

      {deleteProductError && (
        <Typography color="error" sx={{ mb: 1 }}>
          {deleteProductError}
        </Typography>
      )}

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {loadingLookups && (
            <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} /> Loading categories & brands…
            </Typography>
          )}
          {lookupError && <Typography color="error">{lookupError}</Typography>}

          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />

          <Box>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>
              Description
            </Typography>

            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              modules={quillModules}
              formats={quillFormats}
              style={{ height: 180, marginBottom: 40 }}
            />
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Price" value={price} onChange={(e) => setPrice(e.target.value)} required fullWidth />
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="draft">draft</MenuItem>
              <MenuItem value="published">published</MenuItem>
              <MenuItem value="archived">archived</MenuItem>
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required fullWidth />
            <TextField label="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} fullWidth />
          </Stack>

          <Divider />

          <FormControl fullWidth required disabled={loadingLookups || !!lookupError}>
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select labelId="brand-label" label="Brand" value={brandId || ''} onChange={(e) => setBrandId(e.target.value)}>
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

            <Button variant="contained" onClick={handleAddTag} disabled={!canAddTag} sx={{ minWidth: 120 }}>
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
                  deleteIcon={deleting ? <CircularProgress size={16} /> : undefined}
                />
              );
            })}
          </Box>

          <Divider />

          <Typography variant="subtitle1" fontWeight={600}>
            Media (Images / Videos)
          </Typography>

          {!isEdit && (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              You can select media now; it will upload automatically after you click <b>Create</b>.
            </Typography>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={mediaUploading || mutation.isPending}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
            >
              Choose files
              <input hidden type="file" accept="image/*,video/*" multiple onChange={handlePickFiles} />
            </Button>

            {mediaCanManageExisting && pendingFiles.length > 0 && (
              <Button
                variant="contained"
                disabled={mediaUploading || mutation.isPending}
                onClick={() => handleUploadPendingMedia(product._id)}
              >
                {mediaUploading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <CircularProgress size={16} /> Uploading…
                  </span>
                ) : (
                  `Upload ${pendingFiles.length} file(s)`
                )}
              </Button>
            )}
          </Stack>

          {mediaError && <Typography color="error">{mediaError}</Typography>}

          {/* Pending (selected) files */}
          {pendingPreviews.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Selected (not uploaded yet)
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                {pendingPreviews.map((p, globalIdx) => {
                  const kind = p.kind;

                  const isPrimary =
                    (kind === 'image' && pendingPrimaryImageGlobalIdx === globalIdx) ||
                    (kind === 'video' && pendingPrimaryVideoGlobalIdx === globalIdx);

                  return (
                    <Paper key={`${p.file.name}-${globalIdx}`} variant="outlined" sx={{ p: 1.25 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            <b>{kind}</b> — {p.file.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePendingFile(globalIdx)}
                            disabled={mediaUploading || mutation.isPending}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Box sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                          {p.kind === 'image' ? (
                            <img
                              src={p.url}
                              alt={p.file.name}
                              style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <video
                              src={p.url}
                              controls
                              style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                            />
                          )}
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button
                            size="small"
                            variant={isPrimary ? 'contained' : 'outlined'}
                            startIcon={<StarIcon />}
                            onClick={() => handleSetPendingPrimary(globalIdx)}
                            disabled={mediaUploading || mutation.isPending}
                          >
                            {isPrimary ? 'Primary' : 'Set primary'}
                          </Button>

                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {Math.round(p.file.size / 1024)} KB
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Existing media */}
          {existingMedia?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Uploaded
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                {existingMedia.map((m) => {
                  const id = m?._id || m?.id;
                  const kind = (m?.kind || '').toLowerCase();
                  const url = m?.url;
                  const deleting = mediaDeletingIds.has(id);
                  const settingPrimary = mediaPrimarySettingIds.has(id);

                  return (
                    <Paper key={id} variant="outlined" sx={{ p: 1.25, opacity: deleting ? 0.6 : 1 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            <b>{kind}</b>
                            {m?.isPrimary ? (
                              <Chip size="small" label="Primary" sx={{ ml: 1 }} icon={<StarIcon />} />
                            ) : null}
                          </Typography>

                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title={mediaCanManageExisting ? 'Set as primary' : 'Save product first'}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!mediaCanManageExisting || deleting || settingPrimary}
                                  onClick={() => handleSetPrimaryExistingMedia(product._id, id, kind)}
                                >
                                  {settingPrimary ? <CircularProgress size={16} /> : <StarIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title={mediaCanManageExisting ? 'Delete' : 'Save product first'}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!mediaCanManageExisting || deleting || settingPrimary}
                                  onClick={() => handleDeleteExistingMedia(product._id, id)}
                                >
                                  {deleting ? <CircularProgress size={16} /> : <DeleteOutlineIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </Box>

                        <Box sx={{ borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                          {kind === 'image' ? (
                            <img
                              src={url}
                              alt={m?.alt || m?.title || 'product image'}
                              style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <video
                              src={url}
                              controls
                              style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          )}

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
            <Typography color="error">{mutation.error?.message || 'Failed to save product'}</Typography>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disabled={!canSave || mutation.isPending || loadingLookups || mediaUploading || deletingProduct}
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

            <Button variant="outlined" onClick={() => navigate('/dashboard/products')} disabled={mutation.isPending || deletingProduct}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AddEditProductPage;