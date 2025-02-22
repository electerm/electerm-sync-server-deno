// tests/test.spec.ts
import { assertEquals } from "../dev_deps.ts";
import { create, getNumericDate } from "../deps.ts";
import { load } from "../deps.ts";
import { app } from "../src/app.ts";

const env = await load();

// Create crypto key for testing
const encoder = new TextEncoder();
const keyData = encoder.encode(env.JWT_SECRET);
const cryptoKey = await crypto.subtle.importKey(
  "raw",
  keyData,
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

// Create JWT token for testing
const token = await create(
  { alg: "HS256", typ: "JWT" },
  { 
    id: env.JWT_USERS.split(",")[0],
    exp: getNumericDate(60) // Token expires in 60 seconds
  },
  cryptoKey
);

// Test setup
const testData = { sss: 1 };
const PORT = 7838; // Different port for testing
const controller = new AbortController();
const { signal } = controller;

// Start server for testing
const serverPromise = app.listen({ 
  port: PORT,
  signal,
});

// Helper function for requests
async function makeRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`http://localhost:${PORT}${path}`, options);
  return response;
}

Deno.test({
  name: "API Tests",
  async fn(t) {
    // Test /test endpoint
    await t.step("GET /test should return 200", async () => {
      const response = await makeRequest("/test");
      assertEquals(response.status, 200);
      assertEquals(await response.text(), "ok");
    });

    // Test unauthorized access
    await t.step("GET /api/sync without token should return 401", async () => {
      const response = await makeRequest("/api/sync");
      assertEquals(response.status, 401);
    });

    // Test invalid token
    await t.step("GET /api/sync with invalid token should return 401", async () => {
      const response = await makeRequest("/api/sync", {
        headers: {
          Authorization: "Bearer invalid_token",
        },
      });
      assertEquals(response.status, 401);
    });

    // Test GET /api/sync
    await t.step("GET /api/sync with valid token should work", async () => {
      const response = await makeRequest("/api/sync", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      assertEquals(response.status, 404); // Initially should be 404 as no data exists
    });

    // Test PUT /api/sync
    await t.step("PUT /api/sync should store data", async () => {
      const response = await makeRequest("/api/sync", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });
      assertEquals(response.status, 200);
      assertEquals(await response.text(), "ok");
    });

    // Test POST /api/sync
    await t.step("POST /api/sync should return test ok", async () => {
      const response = await makeRequest("/api/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      assertEquals(response.status, 200);
      assertEquals(await response.text(), "test ok");
    });

    // Test GET /api/sync after PUT
    await t.step("GET /api/sync should retrieve stored data", async () => {
      const response = await makeRequest("/api/sync", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      assertEquals(response.status, 200);
      const data = await response.json();
      assertEquals(data.sss, testData.sss);
    });

    // Test invalid user
    await t.step("Request with invalid user should return 401", async () => {
      const invalidToken = await create(
        { alg: "HS256", typ: "JWT" },
        { 
          id: "invalid_user",
          exp: getNumericDate(60)
        },
        cryptoKey
      );

      const response = await makeRequest("/api/sync", {
        headers: {
          Authorization: `Bearer ${invalidToken}`,
        },
      });
      assertEquals(response.status, 401);
      assertEquals(await response.text(), "Invalid user");
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Cleanup test data and server after tests
Deno.test({
  name: "Cleanup",
  async fn() {
    try {
      // Stop the server
      controller.abort();
      await serverPromise;

      // Clean up test data
      const userId = env.JWT_USERS.split(",")[0];
      await Deno.remove(`${env.FILE_STORE_PATH || Deno.cwd()}/${userId}.json`);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});