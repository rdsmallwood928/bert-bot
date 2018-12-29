const Discord = require('discord.js');
const logger = require('winston');

const commander = require('../configuration/CommandLineService').getCommander();
const DynamoDbService = require('../database/DynamoDbService');
const MusicService = require('../music/MusicService');
const Pizza = require('../pizza/PizzaService');
const FortNite = require('../fortnite/FortNite');
const UserService = require('../users/UserService');

const MusicRequestConversation = require('../music/MusicRequestConversation');
const MusicStopConversation = require('../music/MusicStopConversation');
const MusicPropsConversation = require('../music/MusicPropsConversation');
const MusicPlayListConversation = require('../music/MusicPlaylistConversation');
const MostRequestedSongsConversation = require('../music/MostRequestedSongsCoversation');
const FortNiteStatsConversation = require('../fortnite/FortNiteStatsConversation');
const FortNiteDropConversation = require('../fortnite/FortNiteDropConversation');
const FortNiteUserNameUpdateConversation = require('../fortnite/FortNiteUserNameUpdateConversation');

class BertBotService {

  constructor() {
    this.bertBot = new Discord.Client({
      'autoreconnect': true,
      'max_message_cache': 0
    });
    this.voiceChannelName = process.env.VOICE_CHANNEL || commander.voiceChannel;
    this.textChannelName = process.env.TEXT_CHANNEL || commander.textChannel;
    this.awsAccessKeyId = process.env.AWS_ACCESS_KEY || commander.awsAccessKeyId;
    this.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || commander.awsSecretAccessKey;
    this.awsRegion = process.env.AWS_REGION || commander.awsRegion;
    this.fortNiteApi = process.env.FORTNITE || commander.fortNiteApi;
    this.token = process.env.TOKEN || commander.token;
    this.serverName = process.env.SERVER || commander.server;

    this.voiceChannel =  null;
    this.textChannel = null;
    this.voiceConnection = null;

    this.init(this.serverName);

    this.bertBot.login(this.token).then(() => {
      logger.info('Login success!');
    }).catch((error) => {
      logger.error('ERROR! ' + error);
    });
  }

  init(serverName) {
    this.bertBot.on('ready', () => {
      const server = this.bertBot.guilds.find('name', serverName);
      if(server === null) {
        throw 'Couldn\'t find server ' + serverName;
      }
      this.voiceChannel = server.channels.find(channel => channel.name === this.voiceChannelName && channel.type === 'voice');
      if(this. voiceChannel === null) {
        throw 'Couldn\'t find voice channel ' + commander.voiceChannel + ' in server ' + commander.server;
      }

      this.createVoiceConnection();

      this.textChannel = server.channels.find(channel => channel.name === this.textChannelName && channel.type === 'text');
      if(this.textChannel === null) {
        throw 'Couldn\'t find text channel ' + commander.textChannel + ' in server ' + commander.server;
      }

      DynamoDbService.init(this.awsAccessKeyId, this.awsSecretAccessKey, this.awsRegion);
      MusicService.init(this);
      FortNite.init(this.fortNiteApi, this.bertBot);
      const pizza = new Pizza();

      this.bertBot.on('message', (message) => {
        // VALID MESSAGE
        if(message.type !== 'DEFAULT') {
          return;
        }

        // CHECK MESSAGE IS VALID USER
        if(message.author.bot) {
          return;
        }

        logger.info('Message received: ' + message.content);
        if(message.isMentioned(this.bertBot.user)) {
          const messageText = message.content.substr(message.content.indexOf(' ') + 1).toLowerCase();
          if(messageText === 'hi') {
            message.channel.sendMessage('Sup');
          } else if(messageText.includes('music')) {
            MusicService.addToQueue('dMK_npDG12Q', message);
          } else if(messageText.includes('shut up')) {
            UserService.startConversation(new MusicStopConversation(message), message.author.id, message.author.username);
          } else if(messageText.includes('most played songs') || messageText.includes('most requested songs')) {
            UserService.startConversation(new MostRequestedSongsConversation(message), message.author.id, message.author.username);
          } else if(messageText.includes('request')) {
            UserService.startConversation(new MusicRequestConversation(message), message.author.id, message.author.username);
          } else if(messageText.includes('where are ')) {
            message.reply('They\'re UNDER THE GROUND!');
          } else if(messageText.includes('pizza')) {
            pizza.startPizzaOrder(message);
          } else if(messageText.includes('playlist')) {
            UserService.startConversation(new MusicPlayListConversation(message), message.author.id, message.author.username);
          } else if(messageText.includes('mad props')) {
            UserService.startConversation(new MusicPropsConversation(message), message.author.id, message.author.username);
          } else if(messageText.includes('where should we drop') || messageText.includes('where we droppin')) {
            UserService.startConversation(new FortNiteDropConversation(message), message.author.id, message.author.username);
          } else if(messageText.includes('fortnite stats')) {
            UserService.startConversation(new FortNiteStatsConversation(message), message.author.id, message.author.username);
          } else if(messageText.includes('please update my fortnite username')) {
            UserService.startConversation(new FortNiteUserNameUpdateConversation(message), message.author.id, message.author.username);
          } else {
            message.reply('I don\'t understand, please speak english ' + message.author.username);
          }
        } else {
          logger.info('Handling message: ' + message.content);
          UserService.handleMessage(message);
        }
      });
    });
  }

  createVoiceConnection() {
    return this.voiceChannel.join().then((connection) => {
      logger.info('Voice connection established');
      this.voiceConnection = connection;
      return connection;
    }).catch(logger.error);
  }

  setActivity(activity) {
    this.bertBot.user.setActivity(activity);
  }

  getVoiceConnection() {
    return new Promise((resolve, reject) => {
      if(this.voiceConnection) {
        resolve(this.voiceConnection);
      }
      //wait 1 second, if we dont have a connection by then attempt to join
      setTimeout(() =>  {
        if(this.voiceConnection) {
          resolve(this.voiceConnection);
        } else {
          this.createVoiceConnection(() => {
            if(this.voiceConnection) {
              resolve(this.voiceConnection);
            } else {
              //couldn't connect, reject
              reject('Unable to get voice connection');
            }
          });
        }
      }, 1000);
    });
  }

  getBotUserId() {
    return this.bertBot.user.id;
  }

}

module.exports = new BertBotService();
