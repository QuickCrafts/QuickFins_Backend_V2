import {App} from "./app";
import UserRepository from "./repositories/userRepository";
import { databaseUserInterface } from "./interfaces/userInterfaces";
import { databaseUserSchema } from "./schemas/userSchemas";

require("dotenv").config();

async function main(){
    const app = new App(process.env.APP_PORT);
    await app.start();
}

main();