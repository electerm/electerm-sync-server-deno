import { load } from "../deps.ts";
import { app } from "./app.ts";

const env = await load();
const PORT = parseInt(env.PORT || "7837");
const HOST = env.HOST || "127.0.0.1";

console.log(`Server running at http://${HOST}:${PORT}`);
await app.listen({ port: PORT, hostname: HOST });