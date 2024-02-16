const winston = require('winston');

const logLevels = {
    debug: 0,
    http: 1,
    info: 2,
    warning: 3,
    error: 4,
    fatal: 5,
};

winston.addColors({
    debug: 'blue',
    http: 'green',
    info: 'cyan',
    warning: 'yellow',
    error: 'red',
    fatal: 'magenta',
});

const developmentLogger = winston.createLogger({
    levels: logLevels,
    format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/errors.log'}),
        new winston.transports.Console({ level: 'debug' }),
    ],
});

const productionLogger = winston.createLogger({
    levels: logLevels,
    format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }),
        new winston.transports.Console({ level: 'info' }),
    ],
});

const logger = process.env.NODE_ENV === 'production' ? productionLogger : developmentLogger;

module.exports = logger;
