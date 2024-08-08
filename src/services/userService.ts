import { IUserRepository } from "../repositories/userRepository";
import { IMSGraphClient } from "../config/msGraph.config";
import { IMSAuthClient } from "../config/msAuth.config";
import {
  databasePOSTUserInterface,
  databaseGETUserInterface,
} from "../interfaces/databaseUserInterfaces";
import { completePOSTUserInterface } from "../interfaces/completeUserInterfaces";
import {
  databaseGETUserSchema,
  databasePOSTUserSchema,
  databasePUTUserSchema,
} from "../schemas/databaseUserSchemas";
import { createAuthUserSchema } from "../schemas/authUserSchemas";

export interface IUserService {
  createUser(user: completePOSTUserInterface): Promise<any>;
  getUserByEmail(email: string): Promise<databaseGETUserInterface | null>;
  deleteUserByEmail(authId: string, email: string): Promise<any>;
  getUsers(): Promise<any>;
  verifyCredentials(
    email: string,
    password: string
  ): Promise<{ valid: boolean; token?: string }>;
}

export default class UserService implements IUserService {
  private userRepository: IUserRepository;
  private msGraphClient: IMSGraphClient;
  private msAuthClient: IMSAuthClient;

  constructor(
    userRepository: IUserRepository,
    msGraphClient: IMSGraphClient,
    msAuthClient: IMSAuthClient
  ) {
    this.userRepository = userRepository;
    this.msGraphClient = msGraphClient;
    this.msAuthClient = msAuthClient;
  }

  public async createUser(user: completePOSTUserInterface): Promise<{
    success: boolean;
    authId?: string;
    databaseId?: string;
    error?: any;
  }> {
    try {
      const authData = createAuthUserSchema.parse(user);
      const authCreationResult = await this.msGraphClient.createUser(authData);
      const authId = authCreationResult.id;
      const databaseData = databasePOSTUserSchema.parse({ ...user, authId });
      const databaseCreationResult = await this.userRepository.createUser(
        databaseData
      );
      const databaseId = databaseCreationResult.insertedId.toString();

      return { success: true, authId, databaseId: databaseId };
    } catch (error) {
      console.log("An Error Occured while creating user", error);
      return { success: false, error };
    }
  }

  public async getUserByEmail(email: string) {
    try {
      return await this.userRepository.getUserByEmail(email);
    } catch (error) {
      console.log("An Error Occured while retrieving user from email", error);
      throw error;
    }
  }

  public async deleteUserByEmail(authId: string, email: string) {
    try {
      const authDeletionResult = await this.msGraphClient.deleteUser(authId);
      const databaseDeletionResult =
        await this.userRepository.deleteUserByEmail(email);
      return { success: true };
    } catch (error) {
      console.log("An Error Occured while deleting user", error);
      throw error;
    }
  }

  public async getUsers() {
    try {
      return await this.msGraphClient.getUsers();
    } catch (error) {
      console.log("An Error Occured while fetching users", error);
      throw error;
    }
  }

  public async verifyCredentials(email: string, password: string) {
    try {
      return await this.msAuthClient.validateUserCredentials(email, password);
    } catch (error) {
      console.log("An Error Occured while verifying credentials", error);
      throw error;
    }
  }
}
