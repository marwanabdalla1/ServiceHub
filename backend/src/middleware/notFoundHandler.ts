import { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle 404 errors
 * @param req
 * @param res
 * @param next
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Endpoint ${req.originalUrl} not found!`);
    next(error);
};

export default notFoundHandler;
