const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 12_000;

export class ApiError extends Error {
  constructor(message: string, public status = 0, public code = 'NETWORK_ERROR') {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(path: string, init?: RequestInit, schema?: ZodType<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      credentials: 'include',
      signal: controller.signal,
    });
    const payload = response.status === 204 ? undefined : await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(payload?.error?.message || 'ARTHDRISHTI intelligence service is temporarily unavailable.', response.status, payload?.error?.code || 'REQUEST_FAILED');
    }
    if (!schema) return payload as T;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) throw new ApiError('The service returned an unexpected response.', 502, 'INVALID_API_RESPONSE');
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof DOMException && error.name === 'AbortError' ? 'The intelligence request timed out.' : 'ARTHDRISHTI intelligence service is temporarily unavailable.');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
import type { ZodType } from 'zod';
