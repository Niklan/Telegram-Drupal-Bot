/**
 * @file
 * Main code base.
 */
var fs = require('fs');
var $TOKEN;
fs.readFile('TOKEN', 'utf8', function (err, data) {
  if (err) {
    process.exit();
  }
  $TOKEN = String(data);
  bootstrap($TOKEN);
});

/**
 * Boostrap bot after geting token.
 * @param $TOKEN
 */
function bootstrap($TOKEN) {
  console.log($TOKEN);
  var TelegramBot = require('node-telegram-bot-api');
  var Telegram = new TelegramBot($TOKEN, {polling: true});
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
      Telegram.sendMessage(msg.chat.id, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    });
  });
}

