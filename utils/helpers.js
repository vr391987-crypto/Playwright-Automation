import { expect } from '@playwright/test';

export const BASE_URL = process.env.API_BASE_URL ?? 'https://reqres.in';
export const API_KEY = process.env.REQRES_API_KEY ?? '';
export const MAX_RESPONSE_MS = 3000;

/**
 * @typedef {{ id: number, email: string, first_name: string, last_name: string, avatar: string }} User
 */

/** Runs a request and returns the response with its elapsed time in ms. */
export async function timed(call) {
  const start = Date.now();
  const res = await call();
  return { res, ms: Date.now() - start };
}

export function expectJson(res) {
  expect(res.headers()['content-type']).toContain('application/json');
}

/** @returns {boolean} true when the value matches the User shape */
export function isUser(u) {
  return (
    typeof u?.id === 'number' &&
    typeof u.email === 'string' &&
    typeof u.first_name === 'string' &&
    typeof u.last_name === 'string' &&
    typeof u.avatar === 'string'
  );
}
