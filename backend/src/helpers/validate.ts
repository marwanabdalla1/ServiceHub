import {Request, Response} from "express";

/**
 * Handles missing required properties in the request body.
 * @param req - Express request object
 * @param res - Express response object
 * @param requiredProperties - Array of required properties to check in the request body
 * @returns {boolean} - Returns true if any required property is missing, otherwise false
 */
export function errorHandler(req: Request, res: Response, requiredProperties: string[]) {
    for (const property of requiredProperties) {
        if (!req.body[property]) {
            res.status(400).json({
                error: "Bad Request",
                message: `Missing required property: ${property}`
            });
            return true;
        }
    }
    return false;
}

/**
 * Validates the request body for required properties
 * @param req
 * @param res
 * @param requiredProperties
 */
export function validateRequestBody(req: Request, res: Response, requiredProperties: string[]) {
    for (const property of requiredProperties) {
        let value = req.body;
        const keys = property.split('.');
        for (const key of keys) {
            value = value[key];
            if (!value) {
                res.status(400).json({
                    error: "Bad Request",
                    message: `Missing required property: ${property}`
                });
                return true;
            }
        }
    }
    return false;
}
