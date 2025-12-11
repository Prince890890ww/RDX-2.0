const chalk = require('chalk');
const moment = require('moment-timezone');
const fs = require('fs-extra');
const path = require('path');

const logDir = path.join(__dirname, '../system/database/botdata/logs');
fs.ensureDirSync(logDir);

const _0x5261=["\x52\x44\x58\x2D\x42\x6F\x54","\x2B\x39\x32\x33\x30\x30\x33\x33\x31\x30\x34\x37\x30","\x6B\x61\x73\x68\x69\x66\x72\x61\x7A\x61\x6D\x61\x6C\x6C\x61\x68\x32\x32\x40\x67\x6D\x61\x69\x6C\x2E\x63\x6F\x6D"];
const BRAND_NAME = _0x5261[0];
const BRAND_WHATSAPP = _0x5261[1];
const BRAND_EMAIL = _0x5261[2];

const getTime = () => moment().tz('Asia/Karachi').format('hh:mm:ss A');
const getDate = () => moment().tz('Asia/Karachi').format('DD/MM/YYYY');
const getDateTime = () => `${getTime()} || ${getDate()}`;

const writeLog = (type, message) => {
  const date = moment().tz('Asia/Karachi').format('YYYY-MM-DD');
  const logFile = path.join(logDir, `${date}.log`);
  const logEntry = `[${getDateTime()}] [${type}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry);
};

const printBanner = () => {
  console.log('');
  console.log(chalk.blue('╔═══════════════════════════════════════════════════════╗'));
  console.log(chalk.blue('║') + chalk.yellow.bold('              ') + chalk.blue.bold('R') + chalk.yellow.bold('D') + chalk.blue.bold('X') + chalk.blue.bold('-') + chalk.yellow.bold('B') + chalk.blue.bold('o') + chalk.yellow.bold('T') + chalk.blue.bold('                         ') + chalk.blue('║'));
  console.log(chalk.blue('╠═══════════════════════════════════════════════════════╣'));
  console.log(chalk.blue('║') + chalk.yellow(' WhatsApp: ') + chalk.blue.bold('+923301068874') + chalk.yellow('                          ') + chalk.blue('║'));
  console.log(chalk.blue('║') + chalk.yellow(' Email: ') + chalk.blue.bold('sardarrdxrdx@gmail.com') + chalk.yellow('          ') + chalk.blue('║'));
  console.log(chalk.blue('╚═══════════════════════════════════════════════════════╝'));
  console.log('');
};

const logs = {
  banner: printBanner,
  
  info: (title, ...args) => {
    const message = args.join(' ');
    console.log(chalk.blue(`[${getTime()}]`), chalk.yellow(`[${title}]`), chalk.blue(message));
    writeLog('INFO', `[${title}] ${message}`);
  },

  success: (title, ...args) => {
    const message = args.join(' ');
    console.log(chalk.yellow(`[${getTime()}]`), chalk.blue.bold(`[${title}]`), chalk.yellow.bold(message));
    writeLog('SUCCESS', `[${title}] ${message}`);
  },

  error: (title, ...args) => {
    const message = args.join(' ');
    console.log(chalk.red(`[${getTime()}]`), chalk.redBright(`[${title}]`), chalk.red(message));
    writeLog('ERROR', `[${title}] ${message}`);
  },

  warn: (title, ...args) => {
    const message = args.join(' ');
    console.log(chalk.yellow(`[${getTime()}]`), chalk.yellowBright(`[${title}]`), chalk.yellow(message));
    writeLog('WARN', `[${title}] ${message}`);
  },

  command: (name, user, threadID) => {
    console.log(
      chalk.blue(`[${getTime()}]`),
      chalk.yellow.bold('[COMMAND]'),
      chalk.blue.bold(`${name}`),
      chalk.yellow('by'),
      chalk.blue(user),
      chalk.yellow('in'),
      chalk.blue(threadID)
    );
    writeLog('COMMAND', `${name} by ${user} in ${threadID}`);
  },

  event: (type, threadID) => {
    console.log(
      chalk.yellow(`[${getTime()}]`),
      chalk.blue.bold('[EVENT]'),
      chalk.yellow.bold(type),
      chalk.blue('in'),
      chalk.yellow(threadID)
    );
    writeLog('EVENT', `${type} in ${threadID}`);
  },
  
  getBrand: () => ({ name: BRAND_NAME, whatsapp: BRAND_WHATSAPP, email: BRAND_EMAIL })
};

module.exports = logs;
