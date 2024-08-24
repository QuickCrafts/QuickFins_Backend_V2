
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const schemaValidator = (schema: AnyZodObject, target: 'body' | 'params' | 'query' = 'body') => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          error.issues.map((issue) => ({
            message: [issue.path, issue.message],
          }))
        );
      }
      
      return res.status(400).json({ message: 'Algo pasó' });
    }
  };