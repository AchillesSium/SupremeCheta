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
      (typeof text === 'string' && text.trim()
        ? text.slice(0, 180)
        : `${res.status} ${res.statusText}`);
    throw new Error(msg);
  }

  return data;
}

/**
 * GET /api/categories
 * Returns: { success, categories: [...] }
 */
export function getAllCategories() {
  return fetchJson(`${API_BASE_URL}/categories`);
}

/**
 * GET /api/categories/:id
 */
export function getCategoryById(id) {
  return fetchJson(`${API_BASE_URL}/categories/${id}`);
}

/**
 * POST /api/categories (multipart/form-data)
 * formData: name, description, parentCategory?, image(file)
 */
export function createCategory(formData) {
  return fetchJson(`${API_BASE_URL}/categories`, {
    method: 'POST',
    body: formData,
  });
}

/**
 * PUT /api/categories/:id (multipart/form-data)
 * formData: name?, description?, parentCategory?, image(file optional)
 */
export function updateCategory(id, formData) {
  return fetchJson(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

/**
 * DELETE /api/categories/:id
 */
export function deleteCategory(id) {
  return fetchJson(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  });
}
