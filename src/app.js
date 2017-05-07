const Discordie = require('discordie');
const logger = require('winston');

const bertBot = new Discordie();

bertBot.connect({
  token: 'MzEwNTczNjc3NTkyNzA3MDcy.C-_7zA.y_0TVy2vTCzjQYcglMeXtyR9jrg'
});

bertBot.Dispatcher.on(Discordie.Events.GATEWAY_READY, () => {
  logger.info('Connected as: ' + bertBot.User.username);
});

bertBot.Dispatcher.on(Discordie.Events.MESSAGE_CREATE, (e) => {
  logger.info('Message received');
  let message = e.message.content;
  if(e.message.content.substring(0, 2) === '<@') {
    message = message.substr(message.indexOf(' ') + 1);
  }
  logger.info(JSON.stringify(message));
  if(message === 'PING') {
    e.message.channel.sendMessage('PONG');
  }
});
