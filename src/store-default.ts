import { exists, join } from "../deps.ts";
import * as fileStore from "./file-store.ts";

const userStorePath = join(Deno.cwd(), "src", "store.ts");

let userStore;

if (await exists(userStorePath)) {
  userStore = await import(userStorePath);
} else {
  userStore = fileStore;
}

export default userStore;