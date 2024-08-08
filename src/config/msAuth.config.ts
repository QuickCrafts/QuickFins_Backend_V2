import msal from "@azure/msal-node";

export interface IMSAuthClient {
  getToken(): Promise<msal.AuthenticationResult | null>;
  validateUserCredentials(
    email: string,
    password: string
  ): Promise<{
    valid: boolean;
    token?: string;
  }>;
}

export default class MSAuthClient {
  private static instance: MSAuthClient;
  private applicationMSALObject: msal.ConfidentialClientApplication;

  private constructor() {
    const potentialMSQLObj = this.setUpMSALObject();
    if (!potentialMSQLObj == null) {
      throw new Error("Error creating MSAL object");
    }
    this.applicationMSALObject = this.setUpMSALObject()!;
  }

  public static getInstance(): MSAuthClient {
    if (!MSAuthClient.instance) {
      MSAuthClient.instance = new MSAuthClient();
    }
    return MSAuthClient.instance;
  }

  private setUpMSALObject(): msal.ConfidentialClientApplication | null {
    try {
      const entraIDClientID =
        process.env.ENTRAID_CLIENTID ??
        (() => {
          throw new Error("ENTRAID_CLIENTID is not defined");
        })();

      const entraIDAuthority =
        process.env.ENTRAID_AUTHORITY ??
        (() => {
          throw new Error("ENTRAID_AUTHORITY is not defined");
        })();

      const entraIDClientSecret =
        process.env.ENTRAID_CLIENTSECRET ??
        (() => {
          throw new Error("ENTRAID_CLIENTSECRET is not defined");
        })();

      const msalConfig = {
        auth: {
          clientId: entraIDClientID,
          authority: entraIDAuthority,
          clientSecret: entraIDClientSecret,
        },
      };

      const aplicationMSALObject = new msal.ConfidentialClientApplication(
        msalConfig
      );
      return aplicationMSALObject;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async getToken(): Promise<msal.AuthenticationResult | null> {
    const clientCredentialsRequest = {
      scopes: ["https://graph.microsoft.com/.default"],
      skipCache: false,
    };

    try {
      const response =
        await this.applicationMSALObject.acquireTokenByClientCredential(
          clientCredentialsRequest
        );

      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public async validateUserCredentials(
    email: string,
    password: string
  ): Promise<{
    valid: boolean;
    token?: string;
  }> {
    const formattedEmail =
      email.replace("@", "_") + "#EXT#@quickfins.onmicrosoft.com";
    const usernamePasswordRequest = {
      scopes: ["https://graph.microsoft.com/.default"],
      username: formattedEmail,
      password: password,
    };

    try {
      const response =
        await this.applicationMSALObject.acquireTokenByUsernamePassword(
          usernamePasswordRequest
        );
      if (!response) {
        return { valid: false };
      }
      return { valid: !!response.accessToken, token: response.accessToken };
    } catch (error) {
      console.error("Authentication failed:", error);
      return { valid: false };
    }
  }
}
