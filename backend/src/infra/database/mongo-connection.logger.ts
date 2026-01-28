import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

@Injectable()
export class MongoConnectionLogger implements OnApplicationBootstrap {
  private readonly logger = new Logger(MongoConnectionLogger.name);

  constructor(
    @Inject(getConnectionToken())
    private readonly connection: Connection,
  ) {}

  onApplicationBootstrap() {
    // If it connected before this hook runs, still print a confirmation once.
    if (this.connection.readyState === 1) {
      this.logger.log('MongoDB connected');
    }

    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected');
    });

    this.connection.on('error', (err) => {
      this.logger.error('MongoDB connection error', err);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });
  }
}

