import { MongoClient, Db, ServerApiVersion, Collection } from "mongodb";


export interface IMongoDBClient {
  connect(): Promise<void>;
  getCollection(name: string): Collection;
  close(): Promise<void>;
};

export class MongoDBClient implements IMongoDBClient {
  private static instance: MongoDBClient;
  private client: MongoClient;
  private dbName: string;
  private db: Db | null = null;

  private constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MongoDB URI not provided");
    }
    (this.client = new MongoClient(uri)),
      {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      };
    const dbName = process.env.MONGODB_DB;
    if (!dbName) {
      throw new Error("MongoDB database name not provided");
    }
    this.dbName = dbName;
  }

  public static async getInstance(): Promise<MongoDBClient> {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient();
      await MongoDBClient.instance.connect();
    }
    return MongoDBClient.instance;
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
  }

  getCollection(name: string): Collection {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db.collection(name);
  }

  async close() {
    await this.client.close();
    this.db = null;
    console.log("MongoDB connection closed");
  }
}

export default MongoDBClient;
