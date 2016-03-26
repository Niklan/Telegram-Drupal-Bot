/**
 * @file
 * Main code base for bot.
 */

// Include modules.
declare function require(name:string);
var TelegramApi = require('node-telegram-bot-api');
var Telegram = new TelegramApi('', {polling: true});

// Matches /echo [whatever]
Telegram.onText(/\/echo (.+)/, function (msg, match) {
    var fromId = msg.chat.id;
    var resp = match[1];
    Telegram.sendMessage(fromId, resp);
});
