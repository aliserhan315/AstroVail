import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db.js';
import api from './routes/index.routes.js';
import webhooksRouter from './modules/checkout/stripeWebhook.routes.js';
import { config } from './config.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

if (process.env.TRUST_PROXY) app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(webhooksRouter);

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/', (_req, res) => res.json({ message: 'AstroVail API alive' }));
app.use('/api', apiLimiter, api);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/openapi.json', (_req, res) => res.json(swaggerSpec));

try {
  await connectDB();
  app.listen(config.port ?? 3000, () => {
    console.log(`http://localhost:3000`);
  });
} catch (err) {
  console.error('Failed to start server:', err);
  process.exit(1);
}
