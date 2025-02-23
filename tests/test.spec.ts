import { assertEquals } from 'https://deno.land/std@0.180.0/testing/asserts.ts';
import { create, loadEnv } from '../deps.ts';
import { getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';
import { resolve } from 'https://deno.land/std@0.180.0/path/mod.ts';

// Load environment variables
await loadEnv({ export: true });

// Create temp directory for tests
const tempDir = resolve(Deno.cwd(), `test-${crypto.randomUUID()}`);
await Deno.mkdir(tempDir);

// Store original env value
const originalPath = Deno.env.get('FILE_STORE_PATH');

// Set test env value
Deno.env.set('FILE_STORE_PATH', tempDir);

// Create fresh app instance
const { app } = await import('../src/app.ts');

const JWT_SECRET = Deno.env.get('JWT_SECRET')!;
const JWT_USERS = Deno.env.get('JWT_USERS')!;

// Create key for JWT operations
const key = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(JWT_SECRET),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify'],
);

// Create test token
const token = await create(
  { alg: 'HS256', typ: 'JWT' },
  {
    id: JWT_USERS.split(',')[0],
    exp: getNumericDate(60 * 60 * 24), // 24 hours
  },
  key,
);

// Start the test server
const controller = new AbortController();
const { signal } = controller;
const testPort = 7838;

app.listen({
  port: testPort,
  signal,
}).catch((err) => {
  if (err.name !== 'AbortError') {
    console.error(err);
  }
});

// Helper function for making requests
async function makeRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await fetch(`http://localhost:${testPort}${path}`, options);
  return response;
}

// Helper function for making authenticated requests
async function makeAuthRequest(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return await makeRequest(path, options);
}

// Helper function to remove directory recursively
async function removeDir(path: string) {
  try {
    const dir = await Deno.readDir(path);
    for await (const entry of dir) {
      const entryPath = resolve(path, entry.name);
      if (entry.isDirectory) {
        await removeDir(entryPath);
      } else {
        await Deno.remove(entryPath);
      }
    }
    await Deno.remove(path);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
}

// Tests
Deno.test({
  name: 'Basic API test',
  async fn() {
    const response = await makeRequest('/test');
    assertEquals(response.status, 200);
    const text = await response.text();
    assertEquals(text, 'ok');
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: 'API flow test',
  async fn(t) {
    await t.step('GET before data exists', async () => {
      const response = await makeAuthRequest('/api/sync');
      assertEquals(response.status, 404);
      await response.text();
    });

    await t.step('PUT data', async () => {
      const response = await makeAuthRequest('/api/sync', 'PUT', {
        test: 'data',
      });
      assertEquals(response.status, 200);
      const text = await response.text();
      assertEquals(text, 'ok');
    });

    await t.step('GET after data exists', async () => {
      const response = await makeAuthRequest('/api/sync');
      assertEquals(response.status, 200);
      const data = await response.json();
      assertEquals(data.test, 'data');
    });

    await t.step('POST test', async () => {
      const response = await makeAuthRequest('/api/sync', 'POST');
      assertEquals(response.status, 200);
      const text = await response.text();
      assertEquals(text, 'test ok');
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: 'Authentication tests',
  async fn(t) {
    await t.step('Request without token', async () => {
      const response = await makeRequest('/api/sync');
      assertEquals(response.status, 401);
      await response.text();
    });

    await t.step('Request with invalid token', async () => {
      const response = await makeRequest('/api/sync', {
        headers: {
          'Authorization': 'Bearer invalid_token',
        },
      });
      assertEquals(response.status, 401);
      await response.text();
    });

    await t.step('Request with invalid user', async () => {
      const invalidToken = await create(
        { alg: 'HS256', typ: 'JWT' },
        {
          id: 'invalid_user',
          exp: getNumericDate(60 * 60),
        },
        key,
      );

      const response = await makeRequest('/api/sync', {
        headers: {
          'Authorization': `Bearer ${invalidToken}`,
        },
      });
      assertEquals(response.status, 401);
      await response.text();
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Cleanup
Deno.test({
  name: 'cleanup',
  async fn() {
    controller.abort();
    // Clean up the temporary directory
    await removeDir(tempDir);
    // Restore original env value if it existed
    if (originalPath) {
      Deno.env.set('FILE_STORE_PATH', originalPath);
    } else {
      Deno.env.delete('FILE_STORE_PATH');
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Ensure cleanup happens even if tests fail
addEventListener('unload', async () => {
  controller.abort();
  await removeDir(tempDir);
  if (originalPath) {
    Deno.env.set('FILE_STORE_PATH', originalPath);
  } else {
    Deno.env.delete('FILE_STORE_PATH');
  }
});
