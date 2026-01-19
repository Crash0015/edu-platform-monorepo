import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Document, MongoClient } from 'mongodb';


@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private client?: MongoClient;
  private dbName = 'search';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('MONGO_URL', 'mongodb://localhost:27017/search');
    this.client = new MongoClient(url);
    await this.client.connect();
    const parsed = new URL(url);
    if (parsed.pathname && parsed.pathname !== '/') {
      this.dbName = parsed.pathname.replace('/', '');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
    }
  }

  collection<T extends Document>(name: string): Collection<T> {

    if (!this.client) {
      throw new Error('Mongo client not initialized');
    }
    return this.client.db(this.dbName).collection<T>(name);
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(this.client);
  }
}
