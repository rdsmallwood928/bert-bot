const DynamoDbService = require('./database/DynamoDbService');
const Discord = require('discord.js');
const logger = require('winston');
const commander = require('commander');
const Music = require('./music/music');
const Pizza = require('./pizza/PizzaService');
const UserService = require('./users/UserService');
const FortNite = require('./fortnite/FortNite');
const FortNiteStatsConversation = require('./fortnite/FortNiteStatsConversation');
const FortNiteDropConversation = require('./fortnite/FortNiteDropConversation');
const FortNiteUserNameUpdateConversation = require('./fortnite/FortNiteUserNameUpdateConversation');

const bertBot = new Discord.Client({
    'autoreconnect': true,
    'max_message_cache': 0
});

commander
  .option('-t, --token [value]', 'You will need a bert-bot token to run me on discord')
  .option('-v, --voiceChannel [value]', 'A voice channel for the bot to speak in')
  .option('-s, --server [value]', 'A discord server to connect to')
  .option('-x, --textChannel [value]', 'A discord text channel to chat in')
  .option('-y, --youtubeApi [value]', 'Youtube api key for search')
  .option('-f, --fortNiteApi [value]', 'FortNite tracker api key')
  .option('-a, --awsAccessKeyId [value]', 'Aws accessKeyId for dynamodb')
  .option('-S, --awsSecretAccessKey [value]', 'Aws secret access key for dynamodb')
  .option('-r, --awsRegion [value]', 'Aws region for dynamodb')
  .parse(process.argv);

const voiceChannelName = process.env.VOICE_CHANNEL || commander.voiceChannel;
const token = process.env.TOKEN || commander.token;
const serverName = process.env.SERVER || commander.server;
const textChannelName = process.env.TEXT_CHANNEL || commander.textChannel;
const pizza = process.env.PIZZA || commander.pizza;
const youtubeApi = process.env.YOUTUBE || commander.youtubeApi;
const fortNiteApi = process.env.FORTNITE || commander.fortNiteApi;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY || commander.awsAccessKeyId;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || commander.awsSecretAccessKey;
const awsRegion = process.env.AWS_REGION || commander.awsRegion;

logger.info('Token: ' + token);
logger.info('Voice channel: ' + voiceChannelName);
logger.info('Server name: ' + serverName);
logger.info('textChannelName: ' + textChannelName);
logger.info('pizza: ' + pizza);
logger.info('youtube: ' + youtubeApi);
logger.info('fortnite: ' + fortNiteApi);

bertBot.on('ready', () => {
  const server =  bertBot.guilds.find('name', serverName);
  if(server === null) {
    throw 'Couldn\'t find server ' + commander.server;
  }

  const voiceChannel = server.channels.find(channel => channel.name === voiceChannelName && channel.type === 'voice');
  if(voiceChannel === null) {
    throw 'Couldn\'t find voice channel ' + commander.voiceChannel + ' in server ' + commander.server;
  }

  const textChannel = server.channels.find(channel => channel.name === textChannelName && channel.type === 'text');
  if(textChannel === null) {
    throw 'Couldn\'t find text channel ' + commander.textChannel + ' in server ' + commander.server;
  }
  DynamoDbService.init(awsAccessKeyId, awsSecretAccessKey, awsRegion);

  const music = new Music(textChannel, voiceChannel, bertBot, youtubeApi);
	const pizza = new Pizza();
  FortNite.init(fortNiteApi, bertBot);

  bertBot.on('message', (message) => {
    // VALID MESSAGE
    if(message.type !== 'DEFAULT') {
      return;
    }

    // CHECK MESSAGE IS VALID USER
    if(message.author.bot) {
      return;
    }

    logger.info('Message received: ' + message.content);
    if(message.isMentioned(bertBot.user)) {
      const messageText = message.content.substr(message.content.indexOf(' ') + 1).toLowerCase();
      if(messageText === 'hi') {
        message.channel.sendMessage('Sup');
      } else if(messageText.includes('music')) {
        music.addToQueue('dMK_npDG12Q', message);
      } else if(messageText.includes('shut up')) {
        music.stop(message);
      } else if(messageText.includes('request')) {
        music.searchVideo(message, messageText.split(' ').slice(1));
      } else if(messageText.includes('where are ')) {
        message.reply('They\'re UNDER THE GROUND!');
      } else if(messageText.includes('pizza')) {
        pizza.startPizzaOrder(message);
      } else if(messageText.includes('playlist')) {
        music.sendPlaylist(message);
      } else if(messageText.includes('mad props')) {
        music.giveProps(message);
      } else if(messageText.includes('where should we drop') || messageText.includes('where we droppin')) {
        new FortNiteDropConversation(message);
      } else if(messageText.includes('fortnite stats')) {
        UserService.startConversation(new FortNiteStatsConversation(message), message.author.id);
      } else if(messageText.includes('please update my fortnite username')) {
        UserService.startConversation(new FortNiteUserNameUpdateConversation(message), message.author.id);
      } else {
        message.reply('I don\'t understand, please speak english ' + message.author.username);
      }
    } else {
      logger.info('Handling message: ' + message.content);
      UserService.handleMessage(message);
    }
  });
  logger.info('Connected!');
});

bertBot.login(token).then(() => {
  logger.info('Login success!');
}).catch((error) => {
  logger.error('ERROR! ' + error);
});
