import './init.ts';
import { app } from './app.ts';

const PORT = Number(Deno.env.get('PORT') || 7837);
const HOST = Deno.env.get('HOST') || '127.0.0.1';
const JWT_SECRET = Deno.env.get('JWT_SECRET');
const JWT_USERS = Deno.env.get('JWT_USERS');
const DB_PATH = Deno.env.get('DB_PATH') || 'data.db';

console.log('🚀 Starting Electerm Sync Server...');
console.log(`📍 Server will run at: http://${HOST}:${PORT}`);
console.log(`🔐 JWT Secret: ${JWT_SECRET ? '✓ Configured' : '✗ Not configured'}`);
console.log(`👥 JWT Users: ${JWT_USERS ? JWT_USERS.split(',').length + ' users configured' : '✗ Not configured'}`);
console.log(`💾 Storage: SQLite (${DB_PATH})`);

console.log('');
console.log('📖 Usage Instructions:');
console.log('1. In Electerm, go to Settings > Sync');
console.log('2. Set Custom Sync Server:');
console.log(`   - Server URL: http://${HOST}:${PORT}/api/sync`);
console.log('   - JWT Secret: (copy from your .env file)');
console.log('   - User Name: (one of the JWT_USERS from your .env file)');

console.log('');
console.log(`🧪 Test endpoint: http://${HOST}:${PORT}/test`);

console.log('');
console.log('✅ Server is now running and ready to accept connections!');
console.log('🌐 API endpoints:');
console.log('   GET  /api/sync - Read sync data');
console.log('   PUT  /api/sync - Write sync data');
console.log('   POST /api/sync - Test connection');
console.log('   GET  /test     - Health check');

await app.listen({ port: PORT, hostname: HOST });
