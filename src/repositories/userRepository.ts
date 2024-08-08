import { MongoDBClient } from "../config/mongoDB.config";
import { Collection } from "mongodb";
import { z } from "zod";
import { databasePOSTUserInterface, databaseGETUserInterface, databasePUTUserInterface } from "../interfaces/userInterfaces";
import { databasePOSTUserSchema, databasePUTUserSchema } from "../schemas/databaseUserSchemas";

export default class UserRepository {
  private static instance: UserRepository;
  private db: Collection | null = null;

  private constructor(db: Collection) {
    this.db = db;
  }

  // This helps us implement Singleton Pattern
  public static async getInstance(): Promise<UserRepository> {
    if (!UserRepository.instance) {
      const DBClient = await MongoDBClient.getInstance();
      const db = DBClient.getDb().collection("users");
      UserRepository.instance = new UserRepository(db);
    }
    return UserRepository.instance;
  }

  public async createUser(user: databasePOSTUserInterface) {
    try {
      const validatedUser = databasePOSTUserSchema.parse(user);

      return await this.db?.insertOne(validatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation Error", error.errors);
      } else {
        console.log("An Error Occured while creating user", error);
      }

      throw error;
    }
  }

  public async getUserByEmail(email: string) {
    try {
      const validatedEmail = z.string().email().parse(email);

      const getResult = (await this.db?.findOne({
        validatedEmail,
      })) as databaseGETUserInterface | null;

      return getResult;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation Error, Invalid Email", error.errors);
      } else {
        console.log("An Error Occured while retrieving user from email", error);
      }

      throw error;
    }
  }

  public async deleteUserByEmail(email: string) {
    try {
      const validatedEmail = z.string().email().parse(email);

      return await this.db?.deleteOne({ validatedEmail });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation Error, Invalid Email", error.errors);
      } else {
        console.log("An Error Occured while deleting user by email", error);
      }

      throw error;
    }
  }

  public async updateUserByEmail(email: string, user: databasePUTUserInterface) {
    try {
      const validatedEmail = z.string().email().parse(email);
      const validatedUser = databasePUTUserSchema.parse(user);

      return await this.db?.updateOne(
        { email: validatedEmail },
        { $set: validatedUser }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation Error", error.errors);
      } else {
        console.log("An Error Occured while updating user by email", error);
      }

      throw error;
    }
  }
}
