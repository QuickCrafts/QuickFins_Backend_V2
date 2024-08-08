import { App } from "./app";
import setupDependencyInjection from "./config/dependencyInversion/diInitialization";

require("dotenv").config();

async function main() {
  await setupDependencyInjection();
  const app = new App(process.env.APP_PORT);
  await app.start();

}

main();
