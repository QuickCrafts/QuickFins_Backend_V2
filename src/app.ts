import express, {Application} from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

export class App{
    private app: Application;

    constructor(private port?: number | string){
        this.app = express();
        this.settings();
        this.middlewares();
        this.routes();
    }

    settings(){
        this.app.set("port", this.port || process.env.PORT || 8080);
    }

    middlewares(){
        this.app.use(morgan("dev"));
        this.app.use(express.json({limit: "50mb"}));
        this.app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
        this.app.use(express.text({ limit: '200mb' }));
        this.app.use(cookieParser());
    }

    routes(){
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

    async listen(){
        await this.app.listen(this.app.get("port"));
        console.log("Server on port: " + this.app.get("port"));
    }
}