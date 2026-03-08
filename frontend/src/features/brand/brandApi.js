// src/features/brand/brandApi.js
import API_BASE_URL from '../../config';

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      (typeof text === 'string' && text.trim() ? text.slice(0, 180) : `${res.status} ${res.statusText}`);
    throw new Error(msg);
  }

  return data;
}

/**
 * GET /api/brands?page=&limit=&search=
 * Returns: { success, page, limit, total, totalPages, brands: [...] }
 */
export function getAllBrands({ page = 1, limit = 10, search = '' } = {}) {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (search?.trim()) qs.set('search', search.trim());

  return fetchJson(`${API_BASE_URL}/brands?${qs.toString()}`);
}

/**
 * GET /api/brands/:id
 * Returns: { success, brand: {...} }
 */
export function getBrandById(id) {
  return fetchJson(`${API_BASE_URL}/brands/${id}`);
}

/**
 * POST /api/brands (multipart/form-data)
 * formData: name, description, categories (repeat), products (repeat), logo(file)
 */
export function createBrand(formData) {
  return fetchJson(`${API_BASE_URL}/brands`, {
    method: 'POST',
    body: formData, // don't set Content-Type
  });
}

/**
 * PUT /api/brands/:id (multipart/form-data)
 * formData: name?, description?, categories (repeat), products (repeat), logo(file optional)
 */
export function updateBrand(id, formData) {
  return fetchJson(`${API_BASE_URL}/brands/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

/**
 * DELETE /api/brands/:id
 */
export function deleteBrand(id) {
  return fetchJson(`${API_BASE_URL}/brands/${id}`, {
    method: 'DELETE',
  });
}
