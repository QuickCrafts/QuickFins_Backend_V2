import {App} from "./app";

require("dotenv").config();

async function main(){
    const app = new App(process.env.APP_PORT);
    await app.listen();
}

main();