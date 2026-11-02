import { test, expect } from '@playwright/test';

test('Get User', async ({ request }) => {
  const response = await request.get('https://reqres.in/api/users?page=2');
  console.log(await response.json());
  expect(response.status()).toBe(200);
});

test('Create User', async ({ request }) => {
  const response = await request.post('https://reqres.in/api/users', {
    data: {
      name: 'morpheus',
      job: 'leader'
    },
    headers: {
      'Content-Type': 'application/json'
    }   
  });
  console.log(await response.json());
  expect(response.status()).toBe(201);
});
test('Update User', async ({ request }) => {
  const response = await request.put('https://reqres.in/api/users/2', {
    data: {
      name: 'morpheus',
      job: 'zion resident'
    },
    headers: {
      'Content-Type': 'application/json'
    }   
  });
  console.log(await response.json());
  expect(response.status()).toBe(200);
});
test('Delete User', async ({ request }) => {
  const response = await request.delete('https://reqres.in/api/users/2');
  console.log(await response.text());
  expect(response.status()).toBe(204);
});
test('Update User Partially', async ({ request }) => {
  const response = await request.patch('https://reqres.in/api/users/2', {
    data: {
      job: 'zion resident'
    },
    headers: {
      'Content-Type': 'application/json'
    }   
  });
  console.log(await response.json());
  expect(response.status()).toBe(200);
});
test('delay Response', async ({ request }) => {
  const response = await request.get('https://reqres.in/api/users?delay=2');
  console.log(await response.json());
  expect(response.status()).toBe(200);
});