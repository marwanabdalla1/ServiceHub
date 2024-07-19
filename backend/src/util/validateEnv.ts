/**
 * This module validates the environment variables needed for the application.
 * It uses the `envalid` library to validate and clean the environment variables.
 *
 * The `cleanEnv` function takes two parameters:
 * 1. `process.env`: The environment variables to clean.
 * 2. An object that maps each expected variable to a validator.
 *
 * The validators used in this module are:
 * - `str()`: Validates that the environment variable is a string.
 * - `port()`: Validates that the environment variable is a valid port number.
 *
 * If an environment variable is missing or invalid, `cleanEnv` will throw an error.
 *
 * The validated environment variables are:
 * - `MONGO_CONNECTION_STRING`: The connection string for MongoDB.
 * - `PORT`: The port number the server should listen on.
 *
 * @module validateEnv
 */

import {cleanEnv} from "envalid";
import {port, str} from "envalid/dist/validators";

export default cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
});