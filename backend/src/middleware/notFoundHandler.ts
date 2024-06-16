import { Request, Response, NextFunction } from "express";

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Endpoint ${req.originalUrl} not found!`);
    next(error);
};

export default notFoundHandler;
