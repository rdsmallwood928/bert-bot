require('./bertbot/BertBotService');
const logger = require('winston');
const commander = require('./configuration/CommandLineService').getCommander();

const voiceChannelName = process.env.VOICE_CHANNEL || commander.voiceChannel;
const token = process.env.TOKEN || commander.token;
const serverName = process.env.SERVER || commander.server;
const textChannelName = process.env.TEXT_CHANNEL || commander.textChannel;
const pizza = process.env.PIZZA || commander.pizza;
const youtubeApi = process.env.YOUTUBE || commander.youtubeApi;
const fortNiteApi = process.env.FORTNITE || commander.fortNiteApi;

logger.info('Token: ' + token);
logger.info('Voice channel: ' + voiceChannelName);
logger.info('Server name: ' + serverName);
logger.info('textChannelName: ' + textChannelName);
logger.info('pizza: ' + pizza);
logger.info('youtube: ' + youtubeApi);
logger.info('fortnite: ' + fortNiteApi);
