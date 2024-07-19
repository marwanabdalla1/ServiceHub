import { Request, Response, NextFunction } from "express";

/**
 * Middleware to log requests
 * @param req
 * @param res
 * @param next
 */
const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
};

export default logger;
