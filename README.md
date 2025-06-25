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
# Then you can use http://127.0.0.1:7837/api/sync as API Url in electerm custom sync
```

## Test

```bash
deno task test
```

## Write your own data store

Just take [src/file-store.js](src/file-store.js) as an example, write your own
read/write method

## Sync server in other languages

[https://github.com/electerm/electerm/wiki/Custom-sync-server](https://github.com/electerm/electerm/wiki/Custom-sync-server)

## License

MIT
