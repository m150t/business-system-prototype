import type { TripRequest, Expense } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'API error');
  }
  return response.json() as Promise<T>;
}

export const api = {
  async fetchTripRequests(): Promise<TripRequest[]> {
    const res = await fetch(`${BASE_URL}/api/trip-requests`);
    return handleResponse<TripRequest[]>(res);
  },

  async createTripRequest(
    payload: Omit<TripRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<TripRequest> {
    const res = await fetch(`${BASE_URL}/api/trip-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<TripRequest>(res);
  },

  async updateTripStatus(id: string, status: TripRequest['status']): Promise<TripRequest> {
    const res = await fetch(`${BASE_URL}/api/trip-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<TripRequest>(res);
  },

  async fetchExpenses(): Promise<Expense[]> {
    const res = await fetch(`${BASE_URL}/api/expenses`);
    return handleResponse<Expense[]>(res);
  },

  async createExpense(payload: Omit<Expense, 'id'>): Promise<Expense> {
    const res = await fetch(`${BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Expense>(res);
  },

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || 'Failed to delete expense');
    }
  },
};
