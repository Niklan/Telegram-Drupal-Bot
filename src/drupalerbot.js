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
 * Replace with variables.
 *
 * @param string
 *  HTML template with variables.
 *
 * @param variables
 *  Array with values to template.
 *
 * T.e. theme('<span>{{text}}</span>', {text: 'Example'}); will produce:
 * <span>Example</span>.
 */
DrupalerBot.prototype.formatString = function (string, variables) {
  return string.replace(/\{\{([^\}]+)\}\}/g, function (variable, key) {
    return key in variables ? variables[key] : variable;
  });
};

/**
 * Get Drupal project information and send it.
 */
DrupalerBot.prototype.getProjectInfo = function (project, callback) {
  var $this = this;
  var $url = 'https://www.drupal.org/project/' + project;

  request($url, function (error, response, body) {
    if (response.statusCode == 200) {
      var $ = cheerio.load(body),
        title = $('#page-subtitle').html(),
        description = $('meta[name=description]').attr('content'),
        projectInfo = $('.project-info ul').html(),
        installations = /Reported installs: <strong>(.+)<\/strong>/g.exec(projectInfo),
        downloads = /Downloads: (.+)<\/li>/g.exec(projectInfo),
        message = $this.formatString(
          '*{{title}}*\n\r{{description}}\n\r' +
          '💡 *Информация о проекте*\n\r' +
          'Кол-во установок: {{installations}}\n\r' +
          'Кол-во скачиваний: {{downloads}}\n\r\n\r' +
          '💾 *Загрузки*\n\r\n\r',
          {
            title: title,
            description: description,
            installations: installations[1],
            downloads: downloads[1]
          }
        );

      var releases = $this.projectParseDownloads(body);

      /*if (recommendedReleases) {
       message += '*Стабильные релизы*\n\r';
       recommendedReleases.forEach(function (item, i) {
       message += item[0].version + ' - '
       + '[tar.gz](' + item[1].releases[0].link + ') _' + item[1].releases[0].filesize + '_, '
       + '[zip](' + item[1].releases[1].link + ') _' + item[1].releases[1].filesize + '_\n\r';
       });
       }*/

      callback(message);
    }
    else {
      callback('*Произошла ошибка*\n\rВозможно вы опечатались в названии проекта.');
    }
  });
};

/**
 * Parse project releases.
 * @param page
 */
DrupalerBot.prototype.projectParseDownloads = function (page) {
  var $ = cheerio.load(page),
    releases = {
      recommended: {},
      other: {},
      dev: {}
    };


  // Recommended releases.
  $('.view-display-id-recommended > .view-content tbody tr')
    .each(function (i, elem) {
      var $release = i;
      releases.recommended[$release] = {};

      var version = /<a.*>(.+)<\/a>/.exec($('td:nth-child(1)', elem).html());
      releases.recommended[$release].version = version[1];
      releases.recommended[$release].files = {};
      $('td:nth-child(2) a', elem).each(function (i, elem) {
        releases.recommended[$release].files[i] = {
          link: $(elem).attr('href'),
          filesize: $('.filesize', elem).html()
        }
      });
      releases.recommended[$release].date = $('td:nth-child(3)', elem).html();
    });

  return releases;
};

module.exports = new DrupalerBot();