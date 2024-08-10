import { IMongoDBClient } from "../config/mongoDB.config";
import { Collection } from "mongodb";
import { z } from "zod";
import {
  databasePOSTUserInterface,
  databaseGETUserInterface,
  databasePUTUserInterface,
} from "../interfaces/databaseUserInterfaces";
import {
  databasePOSTUserSchema,
  databasePUTUserSchema,
} from "../schemas/databaseUserSchemas";

export interface IUserRepository {
  createUser(user: databasePOSTUserInterface): Promise<any>;
  getUserByEmail(email: string): Promise<databaseGETUserInterface | null>;
  deleteUserByEmail(email: string): Promise<any>;
  updateUserByEmail(
    email: string,
    user: databasePUTUserInterface
  ): Promise<any>;
  getUsers(): Promise<any>;
}

export default class UserRepository implements IUserRepository {
  private collection: Collection;

  constructor(db: IMongoDBClient) {
    this.collection = db.getCollection("users");
  }

  public async createUser(user: databasePOSTUserInterface) {
    try {
      const validatedUser = databasePOSTUserSchema.parse(user);

      return await this.collection.insertOne(validatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation Error", error.errors);
      } else {
        console.log("An Error Occured while creating user", error);
      }

      throw error;
    }
  }

  public async getUsers() {
    try {
      const users = await this.collection.find().toArray();
      return users;
    } catch (error) {
      console.log("An Error Occured while creating user", error);
      throw error;
    }
  }

  public async getUserByEmail(email: string) {
    try {
      const validatedEmail = z.string().email().parse(email);

      const getResult = (await this.collection.findOne({
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

      return await this.collection.deleteOne({ validatedEmail });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation Error, Invalid Email", error.errors);
      } else {
        console.log("An Error Occured while deleting user by email", error);
      }

      throw error;
    }
  }

  public async updateUserByEmail(
    email: string,
    user: databasePUTUserInterface
  ) {
    try {
      const validatedEmail = z.string().email().parse(email);
      const validatedUser = databasePUTUserSchema.parse(user);
      if (Object.keys(validatedUser).length === 0) {
        throw new Error("No valid fields to update");
      }

      return await this.collection.updateOne(
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
