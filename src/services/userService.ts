import { IUserRepository } from "../repositories/userRepository";
import { IMSGraphClient } from "../config/msGraph.config";
import { IMSAuthClient } from "../config/msAuth.config";
import { IAuthRepository } from "../repositories/authRepository";
import { databaseGETUserInterface } from "../interfaces/databaseUserInterfaces";
import { completePOSTUserInterface } from "../interfaces/completeUserInterfaces";
import { databasePOSTUserSchema } from "../schemas/databaseUserSchemas";
import { createAuthUserSchema } from "../schemas/authUserSchemas";
import { mailModule } from "../config/mailer.config";
import { resetPasswordEmail } from "../schemas/emails/authEmailSchemas";

export interface IUserService {
  createUser(user: completePOSTUserInterface): Promise<any>;
  getUserByEmail(email: string): Promise<databaseGETUserInterface | null>;
  getUserById(id: string): Promise<databaseGETUserInterface | null>;
  deleteUserByEmail(authId: string, email: string): Promise<any>;
  getUsers(): Promise<any>;
  verifyCredentials(
    email: string,
    password: string
  ): Promise<{ valid: boolean; token?: string }>;
  requestPasswordReset(email: string): Promise<any>;
  resetPassword(otp: string, newPassword: string): Promise<any>;
  verifyToken(token: string): Promise<any>;
  createToken(databaseId: string): Promise<any>;
}

export default class UserService implements IUserService {
  private authRepository: IAuthRepository;
  private userRepository: IUserRepository;
  private msGraphClient: IMSGraphClient;
  private msAuthClient: IMSAuthClient;

  constructor(
    userRepository: IUserRepository,
    authRepository: IAuthRepository,
    msGraphClient: IMSGraphClient,
    msAuthClient: IMSAuthClient
  ) {
    this.userRepository = userRepository;
    this.authRepository = authRepository;
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

  public async getUserById(id: string) {
    try {
      return await this.userRepository.getUserById(id);
    } catch (error) {
      console.log("An Error Occured while retrieving user from id", error);
      throw error;
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
      await this.msGraphClient.deleteUser(authId);
      this.userRepository.deleteUserByEmail(email);
      return { success: true };
    } catch (error) {
      console.log("An Error Occured while deleting user", error);
      throw error;
    }
  }

  public async updateUser() {
    try {
    } catch (error) {}
  }

  public async getUsers() {
    try {
      const getUsersResult = await this.userRepository.getUsers();
      return getUsersResult;
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

  public async requestPasswordReset(email: string) {
    try {
      const otp = await this.authRepository.createOTP(email);
      const emailHtml = resetPasswordEmail(otp);
      const emailResult = await mailModule().sendMail({
        from: "Quickfins confirmación de creación de cuenta <info@quickfins.co>",
        to: email,
        subject: "Reset Password",
        html: emailHtml,
      });
      return emailResult;
    } catch (error) {
      console.log("An Error Occured while resetting password", error);
      throw error;
    }
  }

  public async resetPassword(otp: string, newPassword: string) {
    try {
      const email = await this.authRepository.getOTP(otp);
      if (!email) {
        throw new Error("Invalid OTP, couldn't get email");
      }
      

      const verifyResult = await this.authRepository.verifyOTP(email, otp);
      if (!verifyResult) {
        throw new Error("Couldn't verify OTP");
      }
      const getResult = await this.userRepository.getUserByEmail(email);
      if (!getResult) {
        throw new Error("User not found");
      }
      const userId = getResult.authId;
      await this.msGraphClient.changePassword(userId, newPassword);
      return email;
    } catch (error) {
      console.log("An Error Occured while resetting password", error);
      throw error;
    }
  }

  public async verifyToken(token: string) {
    try {
      const verifyResult = await this.authRepository.verifyToken(token);
      const userId = verifyResult.databaseId;
      const getResult = await this.userRepository.getUserById(userId);
      if(getResult) {
        return {isValid: true, id: verifyResult.databaseId};
      }
    } catch (error) {
      console.log("An Error Occured while verifying token", error);
      throw error;
    }
  }

  public async createToken(databaseId: string) {
    try {
      return await this.authRepository.createToken(databaseId);
    } catch (error) {
      console.log("An Error Occured while creating token", error);
      throw error;
    }
  }
}
