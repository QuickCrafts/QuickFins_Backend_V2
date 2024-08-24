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

  public RegisterUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user: completePOSTUserInterface = req.body;
      const createResult = await this.userService.createUser(user);
      const databaseId = createResult.databaseId;
      const token = await this.userService.createToken(databaseId);
      res.status(201).send({
        token: token,
      });
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .send({ message: "User registration failed", error: error });
    }
  };

  public RecoverPassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const email = req.body.email;
      await this.userService.requestPasswordReset(email);
      res.status(200).send("Password reset email sent");
    } catch (error) {
      console.log(error);
      res.status(400).send({message: "Password reset email failed", error: error});
    }
  };

  public ResetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const otp = req.body.otp;
      const newPassword = req.body.newPassword;
      await this.userService.resetPassword(otp, newPassword);
      res.status(200).send("Password reset successful");
    } catch (error) {
      res.status(400).send("Password reset failed");
    }
  };

  public ValidateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.body.token;
      const verifyResult = await this.userService.verifyToken(token);
      console.log(verifyResult);
      res.status(200).send({message:"Token is valid", isValid:true, id:verifyResult.id});
    } catch (error) {
      res.status(401).send({message:"Token is invalid", isValid:false});
    }
  };
}
