// tests/test.spec.ts
import { assertEquals } from "../dev_deps.ts";
import { superdeno, type SuperDeno } from "../dev_deps.ts";
import { create, loadEnv } from "../deps.ts";
import { getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { app } from "../src/app.ts";

// Load environment variables
await loadEnv({ export: true });

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const JWT_USERS = Deno.env.get("JWT_USERS")!;

// Create CryptoKey from JWT_SECRET
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(JWT_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

// Create test token
const token = await create(
  { alg: "HS256", typ: "JWT" },
  { 
    id: JWT_USERS.split(",")[0],
    exp: getNumericDate(60 * 60 * 24 * 365 * 120) // 120 years
  },
  key
);

// Helper function for making requests
function makeRequest(method: 'get' | 'post' | 'put' | 'delete', path = '/api/sync'): SuperDeno {
  const request = superdeno(app.handle.bind(app));
  switch (method) {
    case 'get':
      return request.get(path)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
    case 'post':
      return request.post(path)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
    case 'put':
      return request.put(path)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
    case 'delete':
      return request.delete(path)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

Deno.test("Basic API test", async () => {
  const response = await superdeno(app.handle.bind(app))
    .get("/test");
  assertEquals(response.status, 200);
  assertEquals(response.text, "ok");
});

Deno.test("API flow test", async () => {
  // Test GET before data exists
  const getResponse1 = await makeRequest("get");
  assertEquals(getResponse1.status, 404);

  // Test PUT with data
  const putResponse = await makeRequest("put")
    .send({ sss: 1 });
  assertEquals(putResponse.status, 200);
  assertEquals(putResponse.text, "ok");

  // Test GET after data exists
  const getResponse2 = await makeRequest("get");
  assertEquals(getResponse2.status, 200);
  assertEquals(JSON.parse(getResponse2.text).sss, 1);

  // Test POST
  const postResponse = await makeRequest("post");
  assertEquals(postResponse.status, 200);
  assertEquals(postResponse.text, "test ok");
});

Deno.test("Authentication tests", async () => {
  // Test without token
  const noTokenResponse = await superdeno(app.handle.bind(app))
    .get("/api/sync");
  assertEquals(noTokenResponse.status, 401);

  // Test with invalid token
  const invalidTokenResponse = await superdeno(app.handle.bind(app))
    .get("/api/sync")
    .set("Authorization", "Bearer invalid_token");
  assertEquals(invalidTokenResponse.status, 401);

  // Test with invalid user
  const invalidUserToken = await create(
    { alg: "HS256", typ: "JWT" },
    { 
      id: "invalid_user",
      exp: getNumericDate(60 * 60 * 24 * 365 * 120)
    },
    key
  );

  const invalidUserResponse = await superdeno(app.handle.bind(app))
    .get("/api/sync")
    .set("Authorization", `Bearer ${invalidUserToken}`);
  assertEquals(invalidUserResponse.status, 401);
});