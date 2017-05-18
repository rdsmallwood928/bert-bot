const Discord = require('discord.js');
const logger = require('winston');
const commander = require('commander');
const Music = require('./music/music');
const Pizza = require('./pizza/PizzaService');
const bertBot = new Discord.Client({
    autoreconnect: true,
    max_message_cache: 0
});

commander
  .option('-t, --token [value]', 'You will need a bert-bot token to run me on discord')
  .option('-v, --voiceChannel [value]', 'A voice channel for the bot to speak in')
  .option('-s, --server [value]', 'A discord server to connect to')
  .option('-x, --textChannel [value]', 'A discord text channel to chat in')
  .option('-y, --youtubeApi [value]', 'Youtube api key for search')
  .parse(process.argv);

const voiceChannelName = process.env.VOICE_CHANNEL || commander.voiceChannel;
const token = process.env.TOKEN || commander.token;
const serverName = process.env.SERVER || commander.server;
const textChannelName = process.env.TEXT_CHANNEL || commander.textChannel;
const pizza = process.env.PIZZA || commander.pizza;
const youtubeApi = process.env.YOUTUBE || commander.youtubeApi;

logger.info('Token: ' + token);
logger.info('Voice channel: ' + voiceChannelName);
logger.info('Server name: ' + serverName);
logger.info('textChannelName: ' + textChannelName);
logger.info('pizza: ' + pizza);
logger.info('youtube: ' + youtubeApi);

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

  const music = new Music(textChannel, voiceChannel, bertBot, youtubeApi);
	const pizza = new Pizza();

  bertBot.on('message', (message) => {
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
        music.searchVideo(message, messageText.split(' ').slice(2));
      }else if(messageText.includes('where are ')) {
        message.reply('They\'re UNDER THE GROUND!');
      } else if(messageText.includes('pizza')) {
        pizza.startPizzaOrder(message);
      } else {
        message.reply('I don\'t understand, please speak english ' + message.author.username);
      }
    } else {
      logger.info('Handling message: ' + message.content);
      pizza.handleMessage(message);
    }
  });
  logger.info('Connected!');
});

bertBot.login(token).then(() => {
  logger.info('Login success!');
}).catch((error) => {
  logger.error('ERROR! ' + error);
});
