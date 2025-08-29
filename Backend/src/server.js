import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db.js';
import api from './routes/index.js';
import webhooksRouter from './routes/stripeWebhook.js';
import { config } from './config.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(webhooksRouter); 

app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

app.get('/', (_req, res) => res.json({ message: 'AstroVail API alive ✨' }));
app.use('/api', api);

await connectDB();

app.listen(config.port, () => {
  console.log(`🚀 http://localhost:${config.port}`);
});
