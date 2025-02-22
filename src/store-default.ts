import { read, write } from "./file-store.ts";

let userStore = { read, write };

try {
  const customStore = await import("./store.ts");
  userStore = customStore.default;
} catch {
  // Use default file store if custom store doesn't exist
}

export default userStore;