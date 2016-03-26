/**
 * @file
 * Brain of bot.
 */

/**
 * @file
 * Main code for Drupaler Telegram Bot, aka brain.
 */
'use strict';

// Import modules.
var request = require('request');
var parseString = require('xml2js').parseString;
var cheerio = require('cheerio');

/**
 * Brain of Bot.
 * @constructor
 */
var DrupalerBot = function () {
};

/**
 * Get Drupal project information and send it.
 */
DrupalerBot.prototype.getProjectInfo = function (project, callback) {
  var $url = 'https://www.drupal.org/project/' + project;
  request($url, function (error, response, body) {
    if (response.statusCode == 200) {
      var $ = cheerio.load(body),
        title = $('#page-subtitle').html(),
        description = $('meta[name=description]').attr('content');
      var projectInfo = $('.project-info ul').html();
      var installations = /Reported installs: <strong>(.+)<\/strong>/g.exec(projectInfo);
      var downloads = /Downloads: (.+)<\/li>/g.exec(projectInfo);

      var message = '*' + title + '*\n\r'
        + description + '\n\r\n\r'
        + '💡 *Информация о проекте*\n\r'
        + 'Кол-во установок: ' + installations[1] + '\n\r'
        + 'Кол-во скачиваний: ' + downloads[1] + '\n\r\n\r'
        + '💾 *Загрузки*\n\r\n\r';

      var recommendedReleases = [];
      $('.view-id-project_release_download_table.view-display-id-recommended table tbody tr')
        .each(function (i, elem) {
          var $v = i;
          recommendedReleases[$v] = {};
          $('td', elem).each(function (i, elem) {
            var $i = i;
            recommendedReleases[$v][$i] = {};
            switch ($i) {
              case 0: // Version
                var version = /<a.*>(.+)<\/a>/g.exec($(elem).html())
                recommendedReleases[$v][$i].version = version[1];
                break;

              case 1: // Download files
                recommendedReleases[$v][$i].releases = {};
                $('a', elem).each(function (i, elem) {
                  recommendedReleases[$v][$i].releases[i] = {
                    link: $(elem).attr('href'),
                    filesize: $('.filesize', elem).html()
                  }
                });
                break;

              case 2: // Date
                recommendedReleases[$v][$i].date = $(elem).html();
                break;
            }
          });
        });

      if (recommendedReleases) {
        message += '*Стабильные релизы*\n\r';

        recommendedReleases.forEach(function (item, i) {
          message += item[0].version + ' - '
            + '[tar.gz](' + item[1].releases[0].link + ') _' + item[1].releases[0].filesize + '_, '
            + '[zip](' + item[1].releases[1].link + ') _' + item[1].releases[1].filesize + '_\n\r';
        });
      }

      callback(message);
    }
    else {
      callback('*Произошла ошибка*\n\rВозможно вы опечатались в названии проекта.');
    }
  });
};

module.exports = new DrupalerBot();