const { createLogger, transports, format } = require('winston')
const { combine, timestamp, simple, colorize, printf, label } = format
const winstonDaily = require('winston-daily-rotate-file')

require('dotenv').config()

const printFormat = printf(({ timestamp, label, level, message }) => {
    return `${timestamp} [${label}] ${level}: ${message}`
})

const printLogFormat = {
    file: combine(
        label({
            label: 'api 서버',
        }),
        // colorize(),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        printFormat
    ),
    console: combine(colorize(), simple()),
}

const opts = {
    // file: new transports.File({
    //   filename: "access.log",
    //   dirname: "./logs",
    //   level: "info",
    //   format: printLogFormat.file,
    // }),
    console: new transports.Console({
        level: 'info',
        format: printLogFormat.console,
    }),
    infoDaily: new winstonDaily({
        filename: '%DATE%.access.log',
        dirname: './logs',
        level: 'info',
        maxFiles: 7,
        format: printLogFormat.file,
    }),
    errorDaily: new winstonDaily({
        filename: '%DATE%.error.log',
        dirname: './logs',
        level: 'error',
        maxFiles: 30,
        format: printLogFormat.file,
    }),
}

const logger = createLogger({
    transports: [opts.infoDaily, opts.errorDaily],
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(opts.console)
}

module.exports = logger
