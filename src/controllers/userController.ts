import { Request, Response } from "express";
import { IUserService } from "../services/userService";
import { completePOSTUserInterface } from "../interfaces/completeUserInterfaces";

export interface IUserController {
  RegisterUser(req: Request, res: Response): Promise<void>;
  RecoverPassword(req: Request, res: Response): Promise<void>;
  ResetPassword(req: Request, res: Response): Promise<void>;
  ValidateToken(req: Request, res: Response): Promise<void>;
}

export default class UserController implements IUserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  public async RegisterUser(req: Request, res: Response): Promise<void> {
    try {
      const user: completePOSTUserInterface = req.body;
      const createResult = await this.userService.createUser(user);
      const databaseId = createResult.databaseId;
      const token = await this.userService.createToken(databaseId);
      res.status(201).send({
        token: token,
      });
    } catch (error) {
      res.status(400).send("User registration failed");
    }
  }

  public async RecoverPassword(req: Request, res: Response): Promise<void> {
    try {
      const email = req.body.email;
      await this.userService.requestPasswordReset(email);
      res.status(200).send("Password reset email sent");
    } catch (error) {
      res.status(400).send("Password reset email failed");
    }
  }

  public async ResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const otp = req.body.otp;
      const newPassword = req.body.newPassword;
      await this.userService.resetPassword(otp, newPassword);
      res.status(200).send("Password reset successful");
    } catch (error) {
      res.status(400).send("Password reset failed");
    }
  }

  public async ValidateToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.body.token;
      await this.userService.verifyToken(token);
      res.status(200).send("Token is valid");
    } catch (error) {
      res.status(401).send("Token is invalid");
    }
  }
}
