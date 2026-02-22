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
