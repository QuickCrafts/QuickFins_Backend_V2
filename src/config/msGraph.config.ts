import { Client } from "@microsoft/microsoft-graph-client";
import MSAuthClient from "./msAuth.config";
import { createAuthUserInterface } from "../interfaces/authUserInterfaces";

export interface IMSGraphClient {
  initialize(): Promise<void>;
  getUsers(): Promise<any>;
  getUserById(userId: string): Promise<any>;
  createUser(userDetails: createAuthUserInterface): Promise<any>;
  deleteUser(userId: string): Promise<boolean>;
  changePassword(userId: string, newPassword: string): Promise<void>;
}

export default class MSGraphClient {
  private static instance: MSGraphClient;
  private MSAuthClient: MSAuthClient | null = null;
  private client: Client | null = null;

  private constructor() {}

  public async initialize(): Promise<void> {
    this.MSAuthClient = MSAuthClient.getInstance();
    if (!this.MSAuthClient) {
      throw new Error("Error creating MSAL object");
    }

    this.client = Client.init({
      authProvider: async (done) => {
        try {
          const token = await this.MSAuthClient!.getToken();
          if (token) {
            done(null, token.accessToken);
          } else {
            console.error("Failed to acquire token");
            done(new Error("Failed to acquire token"), null);
          }
        } catch (error) {
          console.error("Error in auth provider:", error);
          done(error as Error, null);
        }
      },
    });
  }

  public static getInstance(): MSGraphClient {
    if (!MSGraphClient.instance) {
      MSGraphClient.instance = new MSGraphClient();
    }
    return MSGraphClient.instance;
  }

  public async getUsers() {
    try {
      const response = await this.client!.api("/users").get();
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  public async getUserById(userId: string) {
    try {
      const response = await this.client!.api(`/users/${userId}`).get();
      return response;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  public async createUser(userDetails: createAuthUserInterface) {
    try {
      const emailParts = userDetails.email.split("@");
      const localPart = emailParts[0];
      const parsedDomainEmail = userDetails.email.replace("@", "_");
      const user = {
        accountEnabled: true,
        displayName: localPart,
        mailNickname: localPart,
        userPrincipalName:
          parsedDomainEmail + "#EXT#@quickfins.onmicrosoft.com",
        passwordProfile: {
          password: userDetails.password,
          forceChangePasswordNextSignIn: false,
        },
      };

      console.log("Creating user with details:", user);

      const response = await this.client!.api("/users").post(user);
      return response;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  public async deleteUser(userId: string) {
    try {
      await this.client!.api(`/users/${userId}`).delete();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  public async changePassword(userId: string, newPassword: string) {
    try {
      const passwordProfile = {
        password: newPassword,
        forceChangePasswordNextSignIn: false,
      };

      await this.client!.api(`/users/${userId}`).patch({ passwordProfile });
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }
}
