import express, { Application } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import DependenyInjectionCompositionRoot from "./config/dependencyInversion/diCompositionRoot";
import {IMongoDBClient} from "./config/mongoDB.config";
import { IMSGraphClient } from "./config/msGraph.config";
import { IUserController } from "./controllers/userController";
import { IMSAuthClient } from "./config/msAuth.config";
import {createUserRouter} from "./routes/userRoutes.routes";

export class App {
  private app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.setupCloseHandler();
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
    const userController = DependenyInjectionCompositionRoot.resolve<IUserController>('userController');
    this.app.get("/", (req, res) => {
      res.send("Welcome to QuickFins v2 Backend!");
    });
    this.app.use("/api/user", createUserRouter(userController));
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


  private setupCloseHandler() {
    process.on('SIGINT', async () => {
      console.log('Received SIGINT. Closing MongoDB connection and exiting...');
      try {
        const mongoClient = DependenyInjectionCompositionRoot.resolve<IMongoDBClient>('mongodbClient');
        await mongoClient.close();
        console.log('MongoDB connection closed successfully.');
        process.exit(0);
      } catch (error) {
        console.error('Error while closing MongoDB connection:', error);
        process.exit(1);
      }
    });
  }

  async start() {
    await this.app.listen(this.app.get("port"));
    console.log("Server on port: " + this.app.get("port"));
    //console.log(DependenyInjectionCompositionRoot.listCurrentRegistrations());
  }
}
