import 'setimmediate';
import winston from 'winston';
import config from './config';

const { format, transports } = winston;

const logFormat = format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)

const prettyJson = format.printf(info => {
  if (info.message.constructor === Object) {
    info.message = JSON.stringify(info.message, null, 4)
  }
  return `${info.level}: ${info.message}`
})

export const LoggerService = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : config.logLevel,
  format: format.combine(
    format.label({ label: __filename }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // Format the metadata object
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    prettyJson
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    })
  ],
  exitOnError: false
})