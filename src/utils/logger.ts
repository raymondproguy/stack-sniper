// ./src/utils/logger.ts

import colors from 'colors';

export function getTimestamp() {
  return new Date().toISOString();
}

export function logInfo(message:any, context:any) {
  const timestamp = getTimestamp();
  const contextStr = context ? colors.blue(`[${context}]`) : '';
  console.log(`${colors.gray(timestamp)} ${colors.cyan('INFO')} ${contextStr} ${message}`);
}

export function logSuccess(message:any, context:any) {
  const timestamp = getTimestamp();
  const contextStr = context ? colors.blue(`[${context}]`) : '';
  console.log(`${colors.gray(timestamp)} ${colors.green('SUCCESS')} ${contextStr} ${message}`);
}

export function logError(message:any, context:any) {
  const timestamp = getTimestamp();
  const contextStr = context ? colors.blue(`[${context}]`) : '';
  console.log(`${colors.gray(timestamp)} ${colors.red('ERROR')} ${contextStr} ${message}`);
}
