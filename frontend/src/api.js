const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('Unable to reach the API. Check that the backend is running.', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === 'object' && data?.message ? data.message : 'Request failed.';
    throw new ApiError(message, response.status, data);
  }

  return data;
}

function jsonOptions(method, body) {
  return {
    method,
    body: JSON.stringify(body),
  };
}

export const api = {
  ApiError,

  register: (body) => request('/api/auth/register', jsonOptions('POST', body)),
  login: (body) => request('/api/auth/login', jsonOptions('POST', body)),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  getListings: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request(`/api/listings${suffix}`);
  },
  getListing: (id) => request(`/api/listings/${id}`),
  getMyListings: () => request('/api/listings/mine'),
  createListing: (formData) => request('/api/listings', { method: 'POST', body: formData }),
  updateListing: (id, payload) => {
    const options = payload instanceof FormData
      ? { method: 'PATCH', body: payload }
      : jsonOptions('PATCH', payload);
    return request(`/api/listings/${id}`, options);
  },
  hideListing: (id) => request(`/api/listings/${id}`, { method: 'DELETE' }),
};

export { API_BASE_URL };
