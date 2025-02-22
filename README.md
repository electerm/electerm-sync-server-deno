# Deno Electerm sync server

A simple electerm data sync server implemented in Deno.

## Use

Requires Deno 1.x+

```bash
# Clone the repository
git clone [your-repo-url]
cd electerm-sync-server-deno

# Create env file
cp .env.sample .env

# Start the server
deno run --allow-net --allow-read --allow-env --allow-write src/server.ts

# Server will show: server running at http://127.0.0.1:7837

## Test

```bash
# create env file, then edit .env
cp sample.env .env

deno test --allow-net --allow-read --allow-env --allow-write tests/
```

## Write your own data store

Just take [src/file-store.js](src/file-store.js) as an example, write your own read/write method

## Sync server in other languages

- [electerm-sync-server-kotlin](https://github.com/electerm/electerm-sync-server-kotlin)
- [electerm-sync-server-vercel](https://github.com/electerm/electerm-sync-server-vercel)
- [electerm-sync-server-rust](https://github.com/electerm/electerm-sync-server-rust)
- [electerm-sync-server-cpp](https://github.com/electerm/electerm-sync-server-cpp)
- [electerm-sync-server-java](https://github.com/electerm/electerm-sync-server-java)
- [electerm-sync-server-node](https://github.com/electerm/electerm-sync-server-node)
- [electerm-sync-server-python](https://github.com/electerm/electerm-sync-server-python)

## License

MIT
