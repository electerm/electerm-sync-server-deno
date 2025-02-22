import { Application, Router, verify } from "../deps.ts";
import type { RouterMiddleware, State, RouterContext } from "../deps.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const app = new Application<State>();
const router = new Router<State>();

// Define custom interface for state
interface CustomState extends State {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

// Error handler middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof Error) {
      ctx.response.status = 500;
      ctx.response.body = err.message;
    } else {
      ctx.response.status = 500;
      ctx.response.body = "An unknown error occurred";
    }
  }
});

// JWT authentication middleware
const jwtAuth: RouterMiddleware<string> = async (ctx, next) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = "invalid token...";
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    const payload = await verify(token, key);
    ctx.state.user = payload as { id: string };
    await next();
  } catch {
    ctx.response.status = 401;
    ctx.response.body = "invalid token...";
  }
};

// User check middleware
const userCheck: RouterMiddleware<string> = async (ctx, next) => {
  const user = ctx.state.user;
  if (!user) {
    ctx.response.status = 401;
    ctx.response.body = "invalid user...";
    return;
  }

  const allUsers = Deno.env.get("JWT_USERS")?.split(",") || [];
  
  if (allUsers.includes(user.id)) {
    await next();
  } else {
    ctx.response.status = 401;
    ctx.response.body = "invalid user...";
  }
};

import { read, write } from "./file-store.ts";

router
  .get("/test", (ctx) => {
    ctx.response.body = "ok";
  })
  .put("/api/sync", jwtAuth, userCheck, write)
  .get("/api/sync", jwtAuth, userCheck, read)
  .post("/api/sync", jwtAuth, userCheck, (ctx) => {
    ctx.response.body = "test ok";
  });

app.use(router.routes());
app.use(router.allowedMethods());

export { app };