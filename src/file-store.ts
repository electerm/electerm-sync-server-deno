import './init.ts';
import { resolve } from '../deps.ts';
import type { RouterContext } from '../deps.ts';
import { DB } from 'sqlite3';

const dbPath = Deno.env.get('DB_PATH') || resolve(Deno.cwd(), 'data.db');
const db = new DB(dbPath);

// Initialize database table
db.execute(`
  CREATE TABLE IF NOT EXISTS user_data (
    user_id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  )
`);

export async function write(ctx: RouterContext<string>) {
  const body = await ctx.request.body().value;
  const id = ctx.state.user?.id;

  if (!id) {
    ctx.response.status = 401;
    return;
  }

  const str = JSON.stringify(body || {});
  
  db.query('INSERT OR REPLACE INTO user_data (user_id, data) VALUES (?, ?)', [id, str]);

  ctx.response.body = 'ok';
}

export function read(ctx: RouterContext<string>) {
  const id = ctx.state.user?.id;

  if (!id) {
    ctx.response.status = 401;
    return;
  }

  const result = db.query('SELECT data FROM user_data WHERE user_id = ?', [id]);

  const row = result[0] as [string] | undefined;

  if (row) {
    ctx.response.headers.set('Content-Type', 'application/json');
    ctx.response.body = JSON.parse(row[0]);
  } else {
    ctx.response.status = 404;
    ctx.response.body = 'Data not found';
  }
}
