import { assertEquals } from "https://deno.land/std@0.180.0/testing/asserts.ts";
import { create, loadEnv } from "../deps.ts";
import { getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { resolve } from "https://deno.land/std@0.180.0/path/mod.ts";
import { Application } from "../deps.ts";

// Load environment variables
await loadEnv({ export: true });

// Create temp directory for tests
const tempDir = resolve(Deno.cwd(), `test-${crypto.randomUUID()}`);
await Deno.mkdir(tempDir);

// Store original env value
const originalPath = Deno.env.get("FILE_STORE_PATH");

// Set test env value
Deno.env.set("FILE_STORE_PATH", tempDir);

// Create fresh app instance
const { app } = await import("../src/app.ts");

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const JWT_USERS = Deno.env.get("JWT_USERS")!;

// Create key for JWT operations
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
    exp: getNumericDate(60 * 60 * 24) // 24 hours
  },
  key
);

// Start the test server
const controller = new AbortController();
const { signal } = controller;
const testPort = 7838;

const serverPromise = app.listen({ 
  port: testPort,
  signal
}).catch((err) => {
  if (err.name !== "AbortError") {
    console.error(err);
  }
});

// Helper functions remain the same...

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

// Tests remain the same...

// Cleanup
Deno.test({
  name: "cleanup",
  async fn() {
    controller.abort();
    // Clean up the temporary directory
    await removeDir(tempDir);
    // Restore original env value if it existed
    if (originalPath) {
      Deno.env.set("FILE_STORE_PATH", originalPath);
    } else {
      Deno.env.delete("FILE_STORE_PATH");
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Ensure cleanup happens even if tests fail
addEventListener("unload", async () => {
  controller.abort();
  await removeDir(tempDir);
  if (originalPath) {
    Deno.env.set("FILE_STORE_PATH", originalPath);
  } else {
    Deno.env.delete("FILE_STORE_PATH");
  }
});