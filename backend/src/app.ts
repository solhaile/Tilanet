import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === 'test'
    ? ['*']
    : (process.env.CORS_ORIGIN?.split(',') || []);

interface CorsOptions {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
  credentials: boolean;
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) { callback(null, true); return; }
    if (allowedOrigins.includes('*')) { callback(null, true); return; }
    if (allowedOrigins.includes(origin)) { callback(null, true); }
    else { callback(new Error('Not allowed by CORS')); }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Rate limiting - disabled in test mode to allow concurrent request testing
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'Rate limit exceeded',
    },
  });
  app.use(limiter);
}

// Body parsing middleware
const jsonLimit = process.env.NODE_ENV === 'test' ? '1mb' : '10mb';
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
