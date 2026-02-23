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

/**
 * 1) Create/Get Product Tag FIRST (product_id OPTIONAL)
 * Backend route:
 *    POST /api/products/tags
 * body: { tag_name: "shoes", product_id?: "<optional>" }
 */
export function createOrGetProductTag(body) {
  return fetchJson(`${API_BASE_URL}/products/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * 3) After product created, attach product to tag (product_id REQUIRED)
 * Backend route:
 *    PUT /api/products/tags/:tagId
 * body: { product_id: "<newProductId>" }
 */
export function updateProductTagProductId(tagId, body) {
  return fetchJson(`${API_BASE_URL}/products/tags/${tagId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Detach product from tag (remove productId from ProductTag.product_ids
 * and remove tagId from Product.tags)
 * Backend route:
 *    DELETE /api/products/tags/:tagId/product/:productId
 */
export function detachProductFromTag(tagId, productId) {
  return fetchJson(`${API_BASE_URL}/products/tags/${tagId}/product/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}