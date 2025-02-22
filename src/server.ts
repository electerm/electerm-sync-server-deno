import { loadEnv } from "../deps.ts";
import { app } from "./app.ts";

await loadEnv({ export: true });

const PORT = Number(Deno.env.get("PORT") || 7837);
const HOST = Deno.env.get("HOST") || "127.0.0.1";

console.log(`Server running at http://${HOST}:${PORT}`);

await app.listen({ port: PORT, hostname: HOST });