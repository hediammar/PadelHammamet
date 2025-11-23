/**
 * API wrapper functions for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Specific API wrappers
export const bookingApi = {
  getAvailability: (date: string, courtId: string) =>
    apiRequest(`/availability?date=${date}&courtId=${courtId}`),
  
  createBooking: (booking: unknown) =>
    apiRequest('/bookings', { method: 'POST', body: booking }),
  
  getBookings: (userId: string) =>
    apiRequest(`/bookings?userId=${userId}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  
  logout: () =>
    apiRequest('/auth/logout', { method: 'POST' }),
  
  getCurrentUser: () =>
    apiRequest('/auth/me'),
};

