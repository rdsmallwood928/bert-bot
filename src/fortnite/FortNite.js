const Random = require('random-js');
const logger = require('winston');
const fetch = require('node-fetch');
const Discord = require('discord.js');
const DynamoDbService = require('../database/DynamoDbService');
const UserService = require('../users/UserService');
const UserNotFoundError = require('../users/UserNotFoundError');

class FortNite {

  constructor() {
    this._apiKey = null;
    this._discordClient = null;
    this._statsUrl = 'https://api.fortnitetracker.com/v1/profile';
    this._inConversation = {};
    this._userMapping = {};
    this._statTypeMapping = {
      'stats_solo': 'p2',
      'stats_duo': 'p10',
      'stats_squads': 'p9'
    };

    this.engine = Random.engines.mt19937();
    this.engine.seed(Date.now());
    this.dropLocations = [
      'Haunted Hills',
      'Junk Junction',
      'Loot Lake',
      'Pleasant Park',
      'Snobby Shores',
      'Tilted Towers',
      'Flush Factory',
      'Greasy Grove',
      'Lucky Landing',
      'Shifty Shafts',
      'Fatal Fields',
      'Moisty Mire',
      'Retail Row',
      'Salty Springs',
      'Anarchy Acres',
      'Dusty Divot',
      'Lonely Lodge',
      'Tomato Town',
      'Wailing Woods',
      'Risky Reels'
    ];
  }

  init(apiKey, discordClient) {
    this._apiKey = apiKey;
    this._discordClient = discordClient;
  }

  handleMessage(message) {
    if(this._inConversation[message.author.id]) {
      this._inConversation[message.author.id].handleConversation(message);
      if(this._inConversation[message.author.id].isConversationOver()) {
        delete this._inConversation[message.author.id];
      }
    }
  }

  getRandomDrop() {
    return Random.pick(this.engine, this.dropLocations);
  }

  getStats(userId, userName, displayAvatarURL, tag) {
    //see if the fortnite user name is already known
    return UserService.getUser(userId).then((user) => {
      if(user) {
        return this._fetchStats(user.getFortniteUserName(), displayAvatarURL, tag);
      } else {
        return this._fetchStats(userName, displayAvatarURL, tag);
      }
    });
  }

  _fetchStats(user, displayAvatarURL, tag) {
    return fetch(this._statsUrl + '/pc/' + user,
      {
        'method': 'GET',
        'headers': {
          'TRN-Api-Key': this._apiKey
        }
      }
    ).then((response) => {
      return response.json();
    }).then((json) => {
      const reducedStats = {};
      if(!json['error']) {
        reducedStats['userId'] = this._handleApiData(json, 'accountId');
        reducedStats['userHandle'] = this._handleApiData(json, 'epicUserHandle');
        reducedStats['lifetimeStats'] = this._handleApiData(json, 'stats_lifetime');
        reducedStats['soloStats'] = this._handleApiData(json, 'stats_solo');
        reducedStats['duoStats'] = this._handleApiData(json, 'stats_duo');
        reducedStats['squadStats'] = this._handleApiData(json, 'stats_squads');
      } else {
        reducedStats['error'] = json['error'];
      }
      return reducedStats;
    }).then((reducedStats) => {
      const discordRichEmbed = new Discord.RichEmbed();
      if(reducedStats && !reducedStats.error) {
        discordRichEmbed.setAuthor('Tracking ' + reducedStats['userHandle'], displayAvatarURL);
        discordRichEmbed.setThumbnail(displayAvatarURL);
        discordRichEmbed.addField('Lifetime',
            'Wins: **' + reducedStats['lifetimeStats']['Wins'] +
            '** - K/D: **' + reducedStats['lifetimeStats']['K/d'] +
            '**\nTop 3: **' + reducedStats['lifetimeStats']['Top 3s'] +
            '** - Top 5: **' + reducedStats['lifetimeStats']['Top 5s'] +
            '** - Top 6: **' + reducedStats['lifetimeStats']['Top 6s'] +
            '** - Top 12: **' + reducedStats['lifetimeStats']['Top 12s'] +
            '** - Top 25: **' + reducedStats['lifetimeStats']['Top 25s']
        );

        discordRichEmbed.addField('Solo',
          'Wins: **' + reducedStats['soloStats']['top1'] +
          '** - K/D: **' + reducedStats['soloStats']['kd'] +
          '**');
        discordRichEmbed.addField('Duo',
          'Wins: **' + reducedStats['duoStats']['top1'] +
          '** - K/D: **' + reducedStats['duoStats']['kd'] +
          '**');
        discordRichEmbed.addField('Squads',
          'Wins: **' + reducedStats['squadStats']['top1'] +
          '** - K/D: **' + reducedStats['squadStats']['kd'] +
          '**');
        discordRichEmbed.setFooter('Requested By: ' + tag);
      }
      return {
        fortniteUsername: reducedStats['userHandle'],
        discordRichEmbed: discordRichEmbed,
        success: true,
        error: reducedStats['error']
      };
    }).catch((err) => {
      logger.info(err);
    });
  }

  _handleApiData(resp, data) {
    let stats = null;
    let cleanStats = {};
    switch(data) {
      case 'accountId':
      case 'platformId':
      case 'platformName':
      case 'platformNameLong':
      case 'epicUserHandle':
        return resp[data];
      case 'stats_solo':
      case 'stats_duo':
      case 'stats_squads':
        stats = resp['stats'][this._handleStatType(data)];
        for(let key in stats) {
          cleanStats[key] = stats[key]['displayValue'];
        }
        return cleanStats;
      case 'stats_lifetime':
        stats = resp['lifeTimeStats'];
        for(let key in stats) {
          cleanStats[stats[key]['key']] = stats[key]['value'];
        }
        return cleanStats;
    }
  }

  _handleStatType(type) {
    let mappedType = this._statTypeMapping[type];
    if(!mappedType) {
      mappedType = this._statTypeMapping['stats_solo'];
    }
    return mappedType;
  }

  saveUser(userId, fortniteUsername) {
    DynamoDbService.saveUser(userId, fortniteUsername);
  }
}

module.exports = new FortNite();
