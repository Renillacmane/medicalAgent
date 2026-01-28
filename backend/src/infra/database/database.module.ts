import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConnectionLogger } from './mongo-connection.logger';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Construct MongoDB URI from individual env variables
        // This avoids issues with shell variable expansion in .env files
        const dbUser = config.get<string>('DB_USER');
        const dbPwd = config.get<string>('DB_PWD');
        const dbName = config.get<string>('DB_NAME');
        const mongoUri = config.get<string>('MONGODB_URI');
        
        // If MONGODB_URI exists and doesn't contain unexpanded variables, use it
        // Otherwise, construct from individual variables
        let uri: string;
        if (mongoUri && !mongoUri.includes('${')) {
          uri = mongoUri;
        } else {
          // Construct URI from individual variables
          uri = `mongodb+srv://${dbUser}:${dbPwd}@nodejs.tk4ldce.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=NodeJS`;
        }
        
        // Log the constructed URI (without password for security)
        const logger = new Logger('DatabaseModule');
        const safeUri = uri.replace(/:([^:@]+)@/, ':****@');
        logger.log(`Connecting to MongoDB: ${safeUri}`);
        
        return { uri };
      },
    }),
  ],
  providers: [MongoConnectionLogger],
  exports: [MongooseModule],
})
export class DatabaseModule {}
