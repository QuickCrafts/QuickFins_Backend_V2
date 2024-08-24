import { IMongoDBClient } from "../config/mongoDB.config";
import { Collection } from "mongodb";
import { createOTP } from "../utils/otpModule";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IAuthRepository {
  createOTP(email: string): Promise<any>;
  getOTP(email: string): Promise<any>;
  deleteOTP(email: string): Promise<any>;
  verifyOTP(email: string, otp: string): Promise<any>;
  createToken(email: string): Promise<any>;
  verifyToken(token: string): Promise<any>;
}

export default class AuthRepository implements IAuthRepository {
  private collection: Collection;

  constructor(db: IMongoDBClient) {
    this.collection = db.getCollection("resetOTPs");
    this.setupTTLIndex();
  }

  private async setupTTLIndex() {
    await this.collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 300 }
    );
  }

  async createOTP(email: string): Promise<string> {
    const otp = createOTP(); // Assuming this function generates a 6-digit OTP
    const result = await this.collection.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          otp,
          createdAt: {type:Date, default: new Date(), expires: 10800},
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to create OTP");
    }

    return otp;
  }

  async getOTP(otp: string): Promise<string | null> {
    const result = await this.collection.findOne({ otp });
    return result?.email;
  }

  async deleteOTP(email: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ email });
    return result.deletedCount > 0;
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    try {
      const result = await this.collection.findOneAndDelete({ email, otp });
      if(result === null) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async createToken(databaseId: string): Promise<string> {
    return jwt.sign({ databaseId }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
  }

  async verifyToken(token: string): Promise<string | JwtPayload |false> {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
      if(decodedToken === undefined) {
        return false;
      }
      return decodedToken;
    } catch (error) {
      return false;
    }
  }
}
