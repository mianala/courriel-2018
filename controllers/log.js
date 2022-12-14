const {createLogger, format, transports} = require('winston');
const {combine, timestamp, label, printf} = format;
const transport = new transports.Console();
const logModel = require('../models/log');

const log_format = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), format.json()),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({filename: 'error.log', level: 'error'}),
    new transports.File({filename: 'combined.log'}), transport
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}

module.exports = {
  logger: logger
}