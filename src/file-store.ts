import { join } from "../deps.ts";
import type { RouterContext } from "../deps.ts";

const folder = Deno.env.get("FILE_STORE_PATH") || Deno.cwd();

export async function write(ctx: RouterContext<string>) {
  const body = await ctx.request.body().value;
  const id = ctx.state.user?.id;
  
  if (!id) {
    ctx.response.status = 401;
    return;
  }
  
  const str = JSON.stringify(body || {});
  const path = join(folder, `${id}.json`);
  
  await Deno.writeTextFile(path, str);
  ctx.response.body = "ok";
}

export async function read(ctx: RouterContext<string>) {
  const id = ctx.state.user?.id;
  
  if (!id) {
    ctx.response.status = 401;
    return;
  }

  const path = join(folder, `${id}.json`);
  
  try {
    const content = await Deno.readTextFile(path);
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.body = JSON.parse(content);
  } catch {
    ctx.response.status = 404;
    ctx.response.body = "File not found";
  }
}