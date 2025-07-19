import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

export interface AppConfig {
  enableRateLimit?: boolean;
  rateLimitWindow?: number;
  rateLimitMax?: number;
  enableLogging?: boolean;
  jsonLimit?: string;
}

export function createApp(config: AppConfig = {}): express.Application {
  const {
    enableRateLimit = false,
    rateLimitWindow = 60000, // 1 minute
    rateLimitMax = 3,
    enableLogging = false,
    jsonLimit = '1mb'
  } = config;

  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
  interface CorsOptions {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
  }

  const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  // Rate limiting
  if (enableRateLimit) {
    const limiter = rateLimit({
      windowMs: rateLimitWindow,
      max: rateLimitMax,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'Rate limit exceeded',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);
  }

  // Body parsing middleware
  app.use(express.json({ limit: jsonLimit }));
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  if (enableLogging) {
    app.use(morgan('combined'));
  }

  // API routes
  app.use('/api', routes);

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
