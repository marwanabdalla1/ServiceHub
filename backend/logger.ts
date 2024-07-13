import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),  // Logs to the console
        new winston.transports.File({ filename: 'app.log' })  // Logs to a file named 'app.log'
    ],
});

export default logger;
