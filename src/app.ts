import express, { Application } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import MongoDBClient from "./config/mongoDB.config";
import MSALClient from "./config/msAuth.config";

export class App {
  private app: Application;
  private mongoClient: MongoDBClient | null = null;
  private msalClient: MSALClient | null = null;	

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.setupCloseHandler();
  }

  private async setSingletonClients() {
    this.mongoClient = await MongoDBClient.getInstance();
    this.msalClient = await MSALClient.getInstance();
  }

  settings() {
    this.app.set("port", this.port || process.env.PORT || 8081);
  }

  middlewares() {
    this.app.use(morgan("dev"));
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(
      express.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
      })
    );
    this.app.use(express.text({ limit: "200mb" }));
    this.app.use(cookieParser());
  }

  routes() {
    // this.app.use("/api", Route);
    this.app.get("/", (req, res) => {
      res.send("Welcome to QuickFins v2 Backend!");
    });
  }

  useCors() {
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      })
    );
    console.log("Cors available!");
  }

  async initializeSingletons() {

    await this.setSingletonClients();
    try {
      if (!this.mongoClient) {
        throw new Error("MongoDB Client not initialized");
      }
      await this.mongoClient.connect();
      console.log("MongoDB Successfully connected");
    } catch (error) {
      console.log("An Error Occured while connecting to MongoDB", error);
    }

    try {
      if (!this.msalClient) {
        throw new Error("MSAL Client not initialized");
      }
      console.log("MSAL Successfully initialized");
    } catch (error) {
      console.log("An Error Occured while initializing MSAL", error);
    }


  }

  private setupCloseHandler() {
    process.on('SIGINT', async () => {
        console.log('Received SIGINT. Closing MongoDB connection and exiting...');
        try {
            if (!this.mongoClient) {
                throw new Error('MongoDB Client not initialized');
            }
            await this.mongoClient.close();
            console.log('MongoDB connection closed successfully.');
            process.exit(0);
        } catch (error) {
            console.error('Error while closing MongoDB connection:', error);
            process.exit(1);
        }
    });
}

  async start() {
    await this.initializeSingletons();
    await this.app.listen(this.app.get("port"));
    console.log("Server on port: " + this.app.get("port"));
  }
}
