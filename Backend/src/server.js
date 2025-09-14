import { app } from './app.js';
import { connectDB } from './db.js';
import { config } from './config.js';

const PORT = config.port ?? 3000;

try {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`HTTP listening on http://localhost:${PORT}`);
  });

  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => server.close(() => process.exit(0)));
  }
} catch (err) {
  console.error('Failed to start server:', err);
  process.exit(1);
}
