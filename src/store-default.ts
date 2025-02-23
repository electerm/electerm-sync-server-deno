import { resolve } from '../deps.ts';
import * as fileStore from './file-store.ts';

async function pathExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

const userStorePath = resolve(Deno.cwd(), 'src', 'store.ts');

let userStore;

if (await pathExists(userStorePath)) {
  userStore = await import(userStorePath);
} else {
  userStore = fileStore;
}

export default userStore;
