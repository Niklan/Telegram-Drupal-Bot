/**
 * @file
 * Main code base.
 */
var TelegramBot = require('node-telegram-bot-api');
var Telegram = new TelegramBot('', {polling: true});
var DrupalerBot = require('./src/drupalerbot.js');

/**
 * Project information.
 *
 * @command
 *  /project [project_name]
 *  /p [project_name]
 */
Telegram.onText(/\/(project|p) (.+)/, function (msg, match) {
  DrupalerBot.getProjectInfo(match[2], function (message) {
    console.log(msg);
    Telegram.sendMessage(msg.from.id, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  });
});
