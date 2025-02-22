// src/app.ts
import { Application, Router, Context, Next } from "../deps.ts";
import { create, verify, getNumericDate, Payload } from "../deps.ts";
import { load } from "../deps.ts";
import { read, write } from "./file-store.ts";

const env = await load();

// Create crypto key from JWT_SECRET
const encoder = new TextEncoder();
const keyData = encoder.encode(env.JWT_SECRET);
const cryptoKey = await crypto.subtle.importKey(
  "raw",
  keyData,
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

const app = new Application();
const router = new Router();

// Extend Payload type with our custom fields
interface JWTPayload extends Payload {
  id: string;
}

// Extend Context to include our custom state
interface CustomContext extends Context {
  state: {
    user?: JWTPayload;
  };
}

// JWT verification middleware
async function jwtAuth(ctx: CustomContext, next: Next) {
  try {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "No authorization header";
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = await verify(token, cryptoKey);
    if (!payload || !("id" in payload)) {
      throw new Error("Invalid token");
    }
    ctx.state.user = payload as JWTPayload;
    await next();
  } catch (err) {
    ctx.response.status = 401;
    ctx.response.body = "Invalid token";
  }
}

// User check middleware
async function userCheck(ctx: CustomContext, next: Next) {
  const id = ctx.state.user?.id;
  const allUsers = env.JWT_USERS?.split(",") || [];
  if (id && allUsers.includes(id)) {
    await next();
  } else {
    ctx.response.status = 401;
    ctx.response.body = "Invalid user";
  }
}

// Route handlers
router
  .put("/api/sync", async (ctx: CustomContext) => {
    try {
      const result = ctx.request.body({ type: "json" });
      const body = await result.value;
      if (!ctx.state.user) {
        throw new Error("No user in context");
      }
      await write(ctx.state.user.id, body);
      ctx.response.body = "ok";
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  })
  .get("/api/sync", async (ctx: CustomContext) => {
    try {
      if (!ctx.state.user) {
        throw new Error("No user in context");
      }
      const data = await read(ctx.state.user.id);
      ctx.response.body = data;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        ctx.response.status = 404;
        ctx.response.body = {};
      } else {
        ctx.response.status = 500;
        ctx.response.body = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  })
  .post("/api/sync", (ctx: CustomContext) => {
    ctx.response.body = "test ok";
  })
  .get("/test", (ctx: Context) => {
    ctx.response.body = "ok";
  });

// Apply middleware to protected routes
const protectedRoutes = new Router();
protectedRoutes.use("/api/sync", jwtAuth, userCheck);

// Combine routers
app.use(protectedRoutes.routes());
app.use(protectedRoutes.allowedMethods());
app.use(router.routes());
app.use(router.allowedMethods());

export { app };