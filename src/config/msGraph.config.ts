import { Client } from "@microsoft/microsoft-graph-client";
import MSAuthClient, { IMSAuthClient } from "./msAuth.config";
import { createAuthUserInterface } from "../interfaces/authUserInterfaces";

export interface IMSGraphClient {
  getUsers(): Promise<any>;
  getUserById(userId: string): Promise<any>;
  createUser(userDetails: createAuthUserInterface): Promise<any>;
  deleteUser(userId: string): Promise<boolean>;
  changePassword(userId: string, newPassword: string): Promise<void>;
}

export default class MSGraphClient implements IMSGraphClient {
  private client!: Client;

  constructor(private msAuthClient: IMSAuthClient) {
    if (!this.msAuthClient) {
      throw new Error("MSAuthClient is not provided");
    }

    this.client = Client.init({
      authProvider: async (done) => {
        try {
          const token = await this.msAuthClient.getToken();
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
      const token = await this.msAuthClient.getToken();
      if (!token) {
        throw new Error("Failed to acquire token");
      }
      console.log(
        "Token claims:",
        JSON.parse(atob(token.accessToken.split(".")[1]))
      );
      const passwordProfile = {
        password: newPassword,
        forceChangePasswordNextSignIn: false,
      };

      const response = await this.client!.api(`/users/${userId}`).patch({
        passwordProfile,
      });
      console.log("Password change response:", response);
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }
}
