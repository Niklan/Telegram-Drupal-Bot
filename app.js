/**
 * @file
 * Main code base.
 */
var TelegramBot = require('node-telegram-bot-api');
var Telegram = new TelegramBot('180059939:AAFeUdKgIjQrBmvk2uzQMrKDL0glmIaArEE', {polling: true});
var DrupalerBot = require('./src/drupalerbot.js');

/**
 * Project information.
 *
 * @command
 *  /project [project_name]
 */
Telegram.onText(/\/project (.+)/, function (msg, match) {
  DrupalerBot.getProjectInfo(match[1], function (message) {
    Telegram.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  });
});
