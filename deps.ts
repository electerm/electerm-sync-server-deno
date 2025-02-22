// deps.ts
export { 
  Application, 
  Router,
  Context,
  type Next,
} from "https://deno.land/x/oak@v12.6.1/mod.ts";
export { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
export { 
  create, 
  verify,
  getNumericDate,
  type Payload,
} from "https://deno.land/x/djwt@v3.0.1/mod.ts";
export { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";