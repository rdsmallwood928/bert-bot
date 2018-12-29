const commander = require('commander');

class CommandLineService {

  constructor() {
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
  }

  getCommander() {
    return commander;
  }

}

module.exports = new CommandLineService();
