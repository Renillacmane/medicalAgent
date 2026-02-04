import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async checkHealth() {
    const dbStatus = this.connection.readyState;
    const isConnected = dbStatus === 1; // 1 = connected, 0 = disconnected, 2 = connecting, 3 = disconnecting

    let dbPing: boolean;
    try {
      if (this.connection.db) {
        await this.connection.db.admin().ping();
        dbPing = true;
      } else {
        dbPing = false;
      }
    } catch (error) {
      dbPing = false;
    }

    return {
      status: isConnected && dbPing ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: {
        status: isConnected ? 'connected' : 'disconnected',
        readyState: dbStatus,
        ping: dbPing ? 'ok' : 'failed',
      },
    };
  }
}
