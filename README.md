# Deno Electerm Sync Server

[English](README.md) | [中文](README_CN.md)

A simple and solid Electerm data sync server using SQLite database, implemented in Deno.

## Features

- 🚀 Fast and reliable SQLite database storage
- 🔐 JWT-based authentication
- 📊 User-friendly logging and monitoring
- 🧪 Built-in health checks and connection tests
- 🔧 Easy configuration with environment variables

## Quick Start

### Prerequisites

- Deno 1.x+ (recommend installing from [deno.com](https://deno.com/))

### Installation

```bash
git clone https://github.com/electerm/electerm-sync-server-deno.git
cd electerm-sync-server-deno
```

### Configuration

1. Copy the sample environment file:

   ```bash
   cp sample.env .env
   ```

2. Edit `.env` file with your settings:

   ```env
   # Server configuration
   PORT=7837
   HOST=127.0.0.1

   # Authentication (CHANGE THESE IN PRODUCTION!)
   JWT_SECRET=your-super-secure-jwt-secret-here-make-it-long-and-random
   JWT_USERS=user1,user2,user3

   # Optional: Custom database path (defaults to data.db)
   # DB_PATH=/path/to/your/database.db
   ```

### Running the Server

```bash
deno task start
```

You should see output like:

```text
🚀 Starting Electerm Sync Server...
📍 Server will run at: http://127.0.0.1:7837
🔐 JWT Secret: ✓ Configured
👥 JWT Users: 3 users configured
💾 Storage: SQLite (data.db)

📖 Usage Instructions:
1. In Electerm, go to Settings > Sync
2. Set Custom Sync Server:
   - Server URL: http://127.0.0.1:7837/api/sync
   - JWT Secret: (copy from your .env file)
   - User Name: (one of the JWT_USERS from your .env file)

🧪 Test endpoint: http://127.0.0.1:7837/test

✅ Server is now running and ready to accept connections!
🌐 API endpoints:
   GET  /api/sync - Read sync data
   PUT  /api/sync - Write sync data
   POST /api/sync - Test connection
   GET  /test     - Health check
```

## Usage in Electerm

1. Open Electerm
2. Go to **Settings** → **Sync**
3. Select **Custom Sync Server**
4. Fill in:
   - **Server URL**: `http://your-server-ip:7837/api/sync`
   - **JWT Secret**: Copy from your `.env` file's `JWT_SECRET`
   - **User Name**: One of the users listed in `JWT_USERS` (e.g., `user1`)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sync` | Retrieve sync data for authenticated user |
| PUT | `/api/sync` | Store sync data for authenticated user |
| POST | `/api/sync` | Test connection (returns "test ok") |
| GET | `/test` | Health check (returns "ok") |

All `/api/sync` endpoints require JWT authentication.

## Testing

### Run Unit Tests

```bash
deno task test
```

### Manual Testing

1. **Health Check**:

   ```bash
   curl http://127.0.0.1:7837/test
   # Should return: "ok"
   ```

2. **Connection Test** (requires JWT token):

   ```bash
   # Generate JWT token (you can use online JWT tools or write a script)
   curl -X POST http://127.0.0.1:7837/api/sync \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{}'
   # Should return: "test ok"
   ```

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `7837` | Server port |
| `HOST` | `127.0.0.1` | Server host/IP |
| `JWT_SECRET` | *required* | Secret key for JWT signing |
| `JWT_USERS` | *required* | Comma-separated list of allowed users |
| `DB_PATH` | `data.db` | Path to SQLite database file |

## Troubleshooting

### Server Won't Start

- Check if port 7837 is already in use: `lsof -i :7837`
- Verify Deno version: `deno --version` (should be 1.x+)
- Check `.env` file exists and has required variables

### Authentication Issues

- Verify `JWT_SECRET` matches in both server and Electerm
- Check that user name is in `JWT_USERS` list
- Ensure JWT token hasn't expired

### Database Issues

- Check write permissions for database file location
- Verify `DB_PATH` if using custom location

### Connection Problems

- Test basic connectivity: `curl http://127.0.0.1:7837/test`
- Check firewall settings
- Verify HOST setting allows external connections (use `0.0.0.0` for all interfaces)

## Custom Data Store

The server uses SQLite by default, but you can implement custom storage by creating a new module with `read` and `write` functions. See `src/file-store.ts` for the interface.

Example custom store:

```typescript
async function read(req: Request): Promise<Response> {
  // Your read logic here
}

async function write(req: Request): Promise<Response> {
  // Your write logic here
}

export { read, write }
```

## Production Deployment

- Change `JWT_SECRET` to a long, random string
- Use strong, unique usernames in `JWT_USERS`
- Consider using a reverse proxy (nginx) for SSL
- Set `HOST=0.0.0.0` to accept connections from any interface
- Use environment variables instead of `.env` file for secrets
- Regularly backup the `data.db` file

## Sync Servers in Other Languages

[Custom sync server documentation](https://github.com/electerm/electerm/wiki/Custom-sync-server)

## License

MIT
