// src/file-store.ts
import { load } from "../deps.ts";

const env = await load();
const folder = env.FILE_STORE_PATH || Deno.cwd();

export async function write(id: string, data: Record<string, unknown>): Promise<void> {
  const path = `${folder}/${id}.json`;
  const str = JSON.stringify(data || {});
  await Deno.writeTextFile(path, str);
}

export async function read(id: string): Promise<Record<string, unknown>> {
  const path = `${folder}/${id}.json`;
  try {
    const data = await Deno.readTextFile(path);
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return {};
    }
    throw error;
  }
}