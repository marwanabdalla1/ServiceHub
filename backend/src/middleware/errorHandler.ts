import { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle errors
 * @param error
 * @param req
 * @param res
 * @param next
 */
const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
};

export default errorHandler;
