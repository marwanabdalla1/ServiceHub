import {Request, Response} from "express";
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
