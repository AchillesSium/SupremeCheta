// src/features/product/productApi.js
import API_BASE_URL from '../../config';

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

export function listProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') qs.set(k, String(v));
  });

  return fetchJson(`${API_BASE_URL}/products?${qs.toString()}`);
}

export function getProduct(id) {
  return fetchJson(`${API_BASE_URL}/products/${id}`);
}

export function createProduct(payload) {
  return fetchJson(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload) {
  return fetchJson(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function createOrGetProductTag(body) {
  return fetchJson(`${API_BASE_URL}/products/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function updateProductTagProductId(tagId, body) {
  return fetchJson(`${API_BASE_URL}/products/tags/${tagId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function detachProductFromTag(tagId, productId) {
  return fetchJson(`${API_BASE_URL}/products/tags/${tagId}/product/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export function deleteProduct(id) {
  return fetchJson(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

/* =========================
   PRODUCT MEDIA
   ========================= */

export async function uploadProductMedia(productId, formData) {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/media`, {
    method: 'POST',
    body: formData, // do NOT set Content-Type manually
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

export function setPrimaryProductMedia(productId, mediaId, kind) {
  const qs = new URLSearchParams({ kind });
  return fetchJson(`${API_BASE_URL}/products/${productId}/media/${mediaId}/primary?${qs.toString()}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
}

export function deleteProductMedia(productId, mediaId) {
  return fetchJson(`${API_BASE_URL}/products/${productId}/media/${mediaId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}