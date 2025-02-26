# Deno Electerm sync server

A simple electerm data sync server implemented in Deno.

## Use

Requires Deno 1.x+

```bash
# Clone the repository
git clone https://github.com/electerm/electerm-sync-server-deno.git
cd electerm-sync-server-deno

# Create env file, and change JWT_SECRET
cp .env.sample .env

# Start the server
deno task start

# Server will show: server running at http://127.0.0.1:7837
```

## Test

```bash
deno task test
```

## Write your own data store

Just take [src/file-store.js](src/file-store.js) as an example, write your own
read/write method

## Sync server in other languages

- [electerm-sync-server-kotlin](https://github.com/electerm/electerm-sync-server-kotlin)
- [electerm-sync-server-vercel](https://github.com/electerm/electerm-sync-server-vercel)
- [electerm-sync-server-rust](https://github.com/electerm/electerm-sync-server-rust)
- [electerm-sync-server-cpp](https://github.com/electerm/electerm-sync-server-cpp)
- [electerm-sync-server-java](https://github.com/electerm/electerm-sync-server-java)
- [electerm-sync-server-node](https://github.com/electerm/electerm-sync-server-node)
- [electerm-sync-server-python](https://github.com/electerm/electerm-sync-server-python)
- [electerm-sync-server-deno](https://github.com/electerm/electerm-sync-server-deno)
- [electerm-sync-server-go](https://github.com/electerm/electerm-sync-server-go)

## License

MIT
