const FortNite = require('./FortNite');
const UserService = require('../users/UserService');
const User = require('../users/User');
const logger = require('winston');
const UserNotFoundError = require('../users/UserNotFoundError');

class FortNiteConversation {

  constructor(message) {
    this._fortNiteQuestions = [];
    this._fortNiteQuestions.push(this.getStats.bind(this));
    this._message = message;
    this.handleConversation(message);
  }

  handleConversation(message) {
    this._fortNiteQuestions[0](message);
    this._fortNiteQuestions.splice(0, 1);
  }

  getStats(message) {
    return FortNite.getStats(message.author.id,
      message.author.username,
      message.author.displayAvatarURL,
      message.author.tag
    ).then((data) => {
      if(data && !data.error) {
        this._message.channel.send({
          embed: data['discordRichEmbed']
        });
        UserService.saveUser(message.author.id, new User(
          data['fortniteUsername']
        ));
      } else {
        const error = data.error;
        if(error.getMessage() === UserNotFoundError.getMessage()) {
          message.reply('Hmmm I couldn\'t find stats for user ' + message.author.username + '.  What\'s your FortNite user name?');
          return null;
        } else {
          message.reply('Hmmm I seem to be having issues finding your stats, please try again later');
          return null;
        }
      }
    }).catch((error) => {
      logger.error(error);
    });
  }

  isConversationOver() {
    return this._fortNiteQuestions.length === 0;
  }
}

module.exports = FortNiteConversation;
