import { Router } from "express";
import { IUserController } from "../controllers/userController";
import {completePOSTUserSchema} from "../schemas/completeUserSchemas";
import { schemaValidator } from "../middlewares/validateSchema";

export function createUserRouter(userController: IUserController): Router {
  const userRouter = Router();

  userRouter.post("/register", schemaValidator(completePOSTUserSchema, "body") , userController.RegisterUser);
  userRouter.post("/recover", userController.RecoverPassword);
  userRouter.post("/reset", userController.ResetPassword);
  userRouter.post("/validateToken", userController.ValidateToken);

  return userRouter;
}
