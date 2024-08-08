import { App } from "./app";
import MSGraphClient from "./config/msGraph.config";
import UserRpository from "./repositories/userRepository";
import MSAuthClient from "./config/msAuth.config";

require("dotenv").config();

async function main() {
  const app = new App(process.env.APP_PORT);
  await app.start();

}

main();
