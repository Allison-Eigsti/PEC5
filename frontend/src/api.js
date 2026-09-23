const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE_URL = configuredApiUrl
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const DEFAULT_TIMEOUT_MS = 30000;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function parseResponseBody(contentType, body) {
  if (!body) {
    return null;
  }

  const trimmedBody = body.trim();
  if (contentType.includes('json') || trimmedBody.startsWith('{') || trimmedBody.startsWith('[')) {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  return body;
}

function getErrorMessage(data, fallback) {
  return typeof data === 'object' && data?.message ? data.message : fallback;
}

function requireObject(data, message) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError(message, 502, data);
  }

  return data;
}

async function request(path, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: externalSignal,
    ...fetchOptions
  } = options;
  const headers = new Headers(fetchOptions.headers || {});
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

  if (fetchOptions.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  let timeoutId;
  let externalAbortHandler;

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalAbortHandler = () => controller.abort();
      externalSignal.addEventListener('abort', externalAbortHandler, { once: true });
    }
  }

  if (timeoutMs > 0) {
    timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  }

  let response;
  let rawBody;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
    rawBody = await response.text();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.', 504);
    }

    throw new ApiError('Unable to reach the API. Check that VITE_API_URL points to the backend.', 0);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    if (externalSignal && externalAbortHandler) {
      externalSignal.removeEventListener('abort', externalAbortHandler);
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const data = parseResponseBody(contentType, rawBody);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, response.status === 401 ? 'Your session has expired. Please sign in again.' : 'Request failed.'),
      response.status,
      data,
    );
  }

  if (rawBody && typeof data === 'string') {
    throw new ApiError(
      'The API returned a non-JSON response. Check VITE_API_URL and the Vercel project root directory.',
      502,
      data,
    );
  }

  return requireObject(data, 'The API returned an unexpected response.');
}

function jsonOptions(method, body) {
  return {
    method,
    body: JSON.stringify(body),
  };
}

export const api = {
  ApiError,

  register: async (body) => {
    const data = await request('/api/auth/register', jsonOptions('POST', body));
    if (!data.user) {
      throw new ApiError('The registration response was invalid.', 502, data);
    }
    return data;
  },

  login: async (body) => {
    const data = await request('/api/auth/login', jsonOptions('POST', body));
    if (!data.user) {
      throw new ApiError('The login response was invalid.', 502, data);
    }
    return data;
  },

  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  getListings: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const data = await request(`/api/listings${suffix}`);

    if (!Array.isArray(data.items)) {
      throw new ApiError('The listings API returned an invalid response.', 502, data);
    }

    return {
      ...data,
      page: Number(data.page) || 1,
      pages: Number(data.pages) || 1,
      total: Number(data.total) || 0,
    };
  },

  getListing: async (id) => {
    const data = await request(`/api/listings/${id}`);
    if (!data.listing) {
      throw new ApiError('The listing API returned an invalid response.', 502, data);
    }
    return data;
  },

  getMyListings: async () => {
    const data = await request('/api/listings/mine');
    if (!Array.isArray(data.listings)) {
      throw new ApiError('The listings API returned an invalid response.', 502, data);
    }
    return data;
  },

  createListing: (formData) => request('/api/listings', {
    method: 'POST',
    body: formData,
    timeoutMs: 30000,
  }),

  updateListing: (id, payload) => {
    const options = payload instanceof FormData
      ? { method: 'PATCH', body: payload, timeoutMs: 60000 }
      : { ...jsonOptions('PATCH', payload), timeoutMs: 60000 };
    return request(`/api/listings/${id}`, options);
  },

  hideListing: (id) => request(`/api/listings/${id}`, { method: 'DELETE' }),
};

export { API_BASE_URL };
