import { Router } from "express";
import { IUserController } from "../controllers/userController";

export function createUserRouter(userController: IUserController): Router {
  const userRouter = Router();

  userRouter.post("/register", userController.RegisterUser);
  userRouter.post("/recover", userController.RecoverPassword);
  userRouter.post("/reset", userController.ResetPassword);
  userRouter.post("/validateToken", userController.ValidateToken);

  return userRouter;
}
