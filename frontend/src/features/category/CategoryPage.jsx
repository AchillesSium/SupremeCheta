import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import API_BASE_URL from '../../config';

const CategoryPage = () => {
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(() => new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();
        const arr = Array.isArray(data.categories) ? data.categories : [];
        setAllCategories(arr);
      } catch (err) {
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const { topLevel, childrenByParent } = useMemo(() => {
    const byParent = new Map();
    for (const cat of allCategories) {
      const parentField = cat.parentCategory ?? null;
      const parentId =
        parentField && typeof parentField === 'object'
          ? parentField._id ?? null
          : parentField ?? null;

      if (!byParent.has(parentId)) byParent.set(parentId, []);
      byParent.get(parentId).push(cat);
    }
    // optional: sort siblings
    for (const [, arr] of byParent) arr.sort((a, b) => a.name.localeCompare(b.name));
    return {
      topLevel: byParent.get(null) || [],
      childrenByParent: byParent,
    };
  }, [allCategories]);

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEdit = (category) => {
    navigate('/dashboard/add-category', { state: { category } });
  };

  const handleDelete = async (category) => {
    const children = childrenByParent.get(category._id) || [];
    const warn = children.length
      ? `This category has ${children.length} subcategor${children.length === 1 ? 'y' : 'ies'}.\n\nAre you sure you want to delete "${category.name}"?`
      : `Are you sure you want to delete "${category.name}"?`;

    if (!window.confirm(warn)) return;

    setDeletingIds((prev) => new Set(prev).add(category._id));

    try {
      const res = await fetch(`${API_BASE_URL}/categories/${category._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0, 160)}…`);
      }

      // Remove the deleted category from local state
      setAllCategories((prev) => prev.filter((c) => c._id !== category._id));

      // Also collapse if it was expanded
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(category._id);
        return next;
      });
    } catch (e) {
      alert(e.message || 'Failed to delete category');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(category._id);
        return next;
      });
    }
  };

  const renderNode = (category, depth = 0) => {
    const children = childrenByParent.get(category._id) || [];
    const hasChildren = children.length > 0;
    const isOpen = expanded.has(category._id);
    const isDeleting = deletingIds.has(category._id);

    return (
      <React.Fragment key={category._id}>
        <ListItem disablePadding sx={{ pl: 2 + depth * 2 }}>
          <ListItemButton sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Expand button (visible or invisible placeholder) */}
            <Box sx={{ width: 32, display: 'flex', justifyContent: 'center' }}>
              {hasChildren ? (
                <IconButton
                  edge="start"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(category._id);
                  }}
                >
                  {isOpen ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              ) : (
                // Invisible placeholder to align text
                <Box sx={{ width: 24, height: 24, visibility: 'hidden' }}>
                  <ExpandMore />
                </Box>
              )}
            </Box>

            {/* Category text in the middle */}
            <ListItemText
              primary={category.name}
              secondary={category.description}
              onClick={() => hasChildren && toggle(category._id)}
              sx={{ flex: 1 }}
            />

            {/* Edit / Delete actions on the right */}
            <Tooltip title="Edit">
              <span>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(category);
                  }}
                  sx={{ ml: 1 }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category);
                  }}
                  sx={{ ml: 1 }}
                  disabled={isDeleting}
                >
                  {isDeleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List disablePadding>
              {children.map((child) => renderNode(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/add-category')}>
          Add New Category
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && (topLevel.length > 0 ? (
        <List>{topLevel.map((cat) => renderNode(cat))}</List>
      ) : (
        <Typography>No categories found.</Typography>
      ))}
    </Container>
  );
};

export default CategoryPage;
