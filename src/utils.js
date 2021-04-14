import chalk from "chalk";

export function logDebug(msg) {
  console.log(chalk.gray(msg));
}

export function log(msg) {
  console.log(chalk.white(msg));
}

export function logInfo(msg) {
  console.log(chalk.magentaBright(msg));
}

export function logWarn(msg) {
  console.log(chalk.yellowBright(msg));
}

export function logError(msg) {
  console.log(chalk.redBright(msg));
}

export function logSuccess(msg) {
  console.log(chalk.greenBright(msg));
}

export function logErrorAndFail(err) {
  logError(err);
  process.exit(1);
}

export function sleepMinutes(minutes) {
  return new Promise((resolve) => {
    setTimeout(resolve, minutes * 60000);
  });
}
