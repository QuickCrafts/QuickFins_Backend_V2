import {MongoDBClient} from "../config/mongoDB.config";
import {Collection} from "mongodb";

export class UserRepository {
    private static instance: UserRepository;
    private db: Collection | null = null;

    private constructor() {
        this.db = MongoDBClient.getInstance().getDb().collection("users");
        if (!this.db) {
            throw new Error("Collection not available");
        }
    }

    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }

    async createUser(user: any) {
        try {
            return await this.db?.insertOne(user);
        } catch (error) {
            console.log("An Error Occured while creating user", error);
        }
    }

    async getUserByEmail(email: string) {
        try {
            return await this.db?.findOne({email});
        } catch (error) {
            console.log("An Error Occured while getting user by email", error);
        }
    }
}