const Discord = require('discord.js');
const logger = require('winston');
const commander = require('commander');
const Music = require('./music/music');
const bertBot = new Discord.Client({
    autoreconnect: true,
    max_message_cache: 0
});

commander
  .option('-t, --token [value]', 'You will need a bert-bot token to run me on discord', 'No-token!')
  .option('-v, --voiceChannel [value]', 'A voice channel for the bot to speak in')
  .option('-s, --server [value]', 'A discord server to connect to')
  .option('-x, --textChannel [value]', 'A discord text channel to chat in')
  .parse(process.argv);

logger.info(commander.token);

bertBot.on('ready', () => {
  const server =  bertBot.guilds.find('name', commander.server);
  if(server === null) {
    throw 'Couldn\'t find server ' + commander.server;
  }

  const voiceChannel = server.channels.find(channel => channel.name === commander.voiceChannel && channel.type === 'voice');
  if(voiceChannel === null) {
    throw 'Couldn\'t find voice channel ' + commander.voiceChannel + ' in server ' + commander.server;
  }

  const textChannel = server.channels.find(channel => channel.name === commander.textChannel && channel.type === 'text');
  if(textChannel === null) {
    throw 'Couldn\'t find text channel ' + commander.textChannel + ' in server ' + commander.server;
  }

  const music = new Music(textChannel, voiceChannel, bertBot);

  bertBot.on('message', (message) => {
    logger.info('Message received');
    let messageText = message.content.toLowerCase();
    if(message.content.substring(0, 2) === '<@') {
      messageText = message.content.substr(message.content.indexOf(' ') + 1);
      if(messageText === 'hi') {
        message.channel.sendMessage('Sup');
      } else if(messageText.toLowerCase().includes('music')) {
        music.addToQueue(message);
      } else {
        message.channel.sendMessage('I don\'t understand, please speak english ' + message.author.username);
      }
    }
  });
  logger.info('Connected!');
});

bertBot.login(commander.token);
