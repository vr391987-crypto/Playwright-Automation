import { test, expect } from '../fixtures/fixtures.js';
import { expectJson, isUser, MAX_RESPONSE_MS, timed } from '../utils/helpers.js';

test.describe('Users API', () => {
  test.describe.configure({ mode: 'parallel' });

  test.describe('GET /api/users', () => {
    test('should return a paginated list of users', async ({ request }) => {
      const { res, ms } = await timed(() => request.get('/api/users', { params: { page: 2 } }));
      expect(res.status()).toBe(200);
      expectJson(res);
      expect(ms).toBeLessThan(MAX_RESPONSE_MS);

      const body = await res.json();
      expect(body).toMatchObject({ page: 2 });
      expect(body.per_page).toBeGreaterThan(0);
      expect(body.data.length).toBeLessThanOrEqual(body.per_page);
      body.data.forEach((u) => expect(isUser(u), `invalid user ${JSON.stringify(u)}`).toBe(true));
    });

    test('should return an empty data array for a page beyond the last', async ({ request }) => {
      const res = await request.get('/api/users', { params: { page: 9999 } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual([]);
    });

    test('should honour the delay query parameter', async ({ request }) => {
      const { res, ms } = await timed(() => request.get('/api/users', { params: { delay: 2 } }));
      expect(res.status()).toBe(200);
      expect(ms).toBeGreaterThanOrEqual(1900);
    });

    test('should return 401 when the API key is missing', async ({ noKeyRequest }) => {
      expect((await noKeyRequest.get('/api/users')).status()).toBe(401);
    });

    test('should return 401 when the API key is invalid', async ({ invalidKeyRequest }) => {
      expect((await invalidKeyRequest.get('/api/users')).status()).toBe(401);
    });
  });

  test.describe('GET /api/users/:id', () => {
    test('should return a single user', async ({ request }) => {
      const res = await request.get('/api/users/2');
      expect(res.status()).toBe(200);
      expectJson(res);
      const body = await res.json();
      expect(body.data).toMatchObject({ id: 2 });
      expect(isUser(body.data)).toBe(true);
    });

    test('should return 404 for a non-existent user id', async ({ request }) => {
      const res = await request.get('/api/users/23');
      expect(res.status()).toBe(404);
      expect(await res.json()).toEqual({});
    });

    test('should return 404 for a non-numeric user id', async ({ request }) => {
      expect((await request.get('/api/users/abc')).status()).toBe(404);
    });
  });

  test.describe('POST /api/users', () => {
    test('should create a user and echo the payload', async ({ request }) => {
      const payload = { name: 'morpheus', job: 'leader' };
      const { res, ms } = await timed(() => request.post('/api/users', { data: payload }));
      expect(res.status()).toBe(201);
      expectJson(res);
      expect(ms).toBeLessThan(MAX_RESPONSE_MS);

      const body = await res.json();
      expect(body).toMatchObject(payload);
      expect(body.id).toEqual(expect.any(String));
      expect(new Date(body.createdAt).getTime()).not.toBeNaN();
    });

    test('should accept an empty payload', async ({ request }) => {
      const res = await request.post('/api/users', { data: {} });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.id).toBeTruthy();
    });

    test('should handle a very long field value', async ({ request }) => {
      const res = await request.post('/api/users', { data: { name: 'a'.repeat(10_000), job: 'x' } });
      expect([201, 400, 413]).toContain(res.status());
    });

    test('should reject malformed JSON with a 4xx status', async ({ request }) => {
      const res = await request.post('/api/users', {
        headers: { 'Content-Type': 'application/json' },
        data: '{"name": "morpheus", ',
      });
      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
    });

    test('should return 401 when the API key is missing', async ({ noKeyRequest }) => {
      const res = await noKeyRequest.post('/api/users', { data: { name: 'x', job: 'y' } });
      expect(res.status()).toBe(401);
    });
  });

  test.describe('PUT/PATCH /api/users/:id', () => {
    test('should fully update a user with PUT', async ({ request }) => {
      const payload = { name: 'morpheus', job: 'zion resident' };
      const res = await request.put('/api/users/2', { data: payload });
      expect(res.status()).toBe(200);
      expectJson(res);
      const body = await res.json();
      expect(body).toMatchObject(payload);
      expect(new Date(body.updatedAt).getTime()).not.toBeNaN();
    });

    test('should partially update a user with PATCH', async ({ request }) => {
      const res = await request.patch('/api/users/2', { data: { job: 'zion resident' } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toMatchObject({ job: 'zion resident' });
      expect(body.updatedAt).toBeTruthy();
    });

    test('should return 401 when the API key is missing', async ({ noKeyRequest }) => {
      expect((await noKeyRequest.put('/api/users/2', { data: { name: 'x' } })).status()).toBe(401);
    });
  });

  test.describe('DELETE /api/users/:id', () => {
    test('should delete a user and return an empty 204 body', async ({ request }) => {
      const res = await request.delete('/api/users/2');
      expect(res.status()).toBe(204);
      expect(await res.text()).toBe('');
    });

    test('should return 401 when the API key is missing', async ({ noKeyRequest }) => {
      expect((await noKeyRequest.delete('/api/users/2')).status()).toBe(401);
    });
  });
});
