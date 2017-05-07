const Discordie = require('discordie');
const logger = require('winston');
const commander = require('commander');

const bertBot = new Discordie();

commander
  .option('-t, --token [value]', 'You will need a bert-bot token to run me on discord', 'No-token!')
  .parse(process.argv);

logger.info(commander.token);

bertBot.connect({
  token: commander.token
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
