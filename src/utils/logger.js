/**
 * Logger utility for development and production
 * In production (build), console.log and console.debug are disabled
 * console.warn and console.error remain active for debugging issues
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: isDev ? console.debug.bind(console) : () => {},
  info: isDev ? console.info.bind(console) : () => {},
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};
