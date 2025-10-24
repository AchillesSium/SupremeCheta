// src/features/brand/BrandPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
    Typography,
    TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import API_BASE_URL from '../../config';

const ORIGIN = new URL(API_BASE_URL).origin;
const publicUrl = (p) => (!p ? '' : (/^https?:\/\//i.test(p) ? p : `${ORIGIN}/${p.replace(/^\//, '')}`));

const BrandPage = () => {
    const navigate = useNavigate();

    // data
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // actions
    const [deletingIds, setDeletingIds] = useState(new Set());

    // pagination + search
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const queryString = useMemo(() => {
        const q = new URLSearchParams();
        q.set('page', String(page));
        q.set('limit', String(limit));
        if (search.trim()) q.set('search', search.trim());
        return q.toString();
    }, [page, limit, search]);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${API_BASE_URL}/brands?${queryString}`);
            if (!res.ok) throw new Error('Failed to fetch brands');
            const data = await res.json();

            const items = Array.isArray(data.brands) ? data.brands : [];
            setBrands(items);
            setTotalPages(Number(data.totalPages || 1));
        } catch (e) {
            setError(e.message || 'Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryString]);

    const handleEdit = (brand) => {
        navigate('/dashboard/add-brand', { state: { brand } });
    };

    const handleDelete = async (brand) => {
        if (!window.confirm(`Delete brand "${brand.name}"?`)) return;

        setDeletingIds((prev) => new Set(prev).add(brand._id));
        try {
            const res = await fetch(`${API_BASE_URL}/brands/${brand._id}`, { method: 'DELETE' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0, 160)}…`);
            }
            // refetch current page after delete (simplest to keep pagination consistent)
            fetchBrands();
        } catch (e) {
            alert(e.message || 'Failed to delete brand');
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(brand._id);
                return next;
            });
        }
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    return (
        <Container>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2} gap={2}>
                <Typography variant="h5" sx={{ flexShrink: 0 }}>Brands</Typography>

                <Box
                    component="form"
                    onSubmit={onSearchSubmit}
                    sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1, maxWidth: 520 }}
                >
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Search brands…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <Button type="submit" variant="outlined">Search</Button>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/dashboard/add-brand')}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Add New Brand
                </Button>
            </Box>

            {/* Body */}
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}

            {!loading && !error && (
                brands.length > 0 ? (
                    <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                        {brands.map((brand, idx) => {
                            const isDeleting = deletingIds.has(brand._id);
                            const src = brand.logoUrl || publicUrl(brand.logo);

                            return (
                                <React.Fragment key={brand._id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        secondaryAction={
                                            <Box>
                                                <Tooltip title="Edit">
                                                    <span>
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={() => handleEdit(brand)}
                                                            disabled={isDeleting}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <span>
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(brand)}
                                                            disabled={isDeleting}
                                                            sx={{ ml: 1 }}
                                                        >
                                                            {isDeleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Box>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={src || undefined}
                                                alt={brand.name}
                                                variant="rounded"
                                                sx={{ width: 44, height: 44 }}
                                            >
                                                {brand.name?.[0]?.toUpperCase() || 'B'}
                                            </Avatar>
                                        </ListItemAvatar>

                                        <ListItemText
                                            primary={brand.name}
                                            secondary={brand.description}
                                            sx={{ pr: 10 }}  // <-- reserve space for action buttons
                                            primaryTypographyProps={{ sx: { wordBreak: 'break-word' } }}
                                            secondaryTypographyProps={{
                                                sx: {
                                                    wordBreak: 'break-word',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,          // clamp if you want
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                },
                                            }}
                                        />
                                    </ListItem>

                                    {idx < brands.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                ) : (
                    <Typography>No brands found.</Typography>
                )
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="body2">
                        Page {page} of {totalPages}
                    </Typography>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </Box>
                </Box>
            )}
        </Container>
    );
};

export default BrandPage;
