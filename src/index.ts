import { App } from "./app";
import DependenyInjectionCompositionRoot from "./config/dependencyInversion/diCompositionRoot";
import setupDependencyInjection from "./config/dependencyInversion/diInitialization";
import { IMongoDBClient } from "./config/mongoDB.config";
import { IMSAuthClient } from "./config/msAuth.config";
import { IMSGraphClient } from "./config/msGraph.config";

require("dotenv").config();

async function main() {
  await setupDependencyInjection();
  const mongoClient =
    DependenyInjectionCompositionRoot.resolve<IMongoDBClient>("mongodbClient");
  const msGraphClient =
    DependenyInjectionCompositionRoot.resolve<IMSGraphClient>("msGraphClient");

  await mongoClient.connect();

  const app = new App(process.env.APP_PORT);
  await app.start();
}

main();
