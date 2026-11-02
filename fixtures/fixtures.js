import { test as base } from '@playwright/test';
import { API_KEY, BASE_URL } from '../utils/helpers.js';

export const test = base.extend({
  request: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'x-api-key': API_KEY, Accept: 'application/json' },
    });
    await use(ctx);
    await ctx.dispose();
  },
  noKeyRequest: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL });
    await use(ctx);
    await ctx.dispose();
  },
  invalidKeyRequest: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'x-api-key': 'invalid-key' },
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from '@playwright/test';
