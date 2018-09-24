const FortNite = require('./FortNite');
const UserService = require('../users/UserService');
const User = require('../users/User');
const logger = require('winston');
const UserNotFoundError = require('../users/UserNotFoundError');
const Conversation = require('../conversation/Conversation');

class FortNiteConversation extends Conversation {

  constructor(message) {
    super(message);
    this.addQuestion(this.getStats);
  }

  getStats(message) {
    return FortNite.getStats(message.author.id,
      message.author.username,
      message.author.displayAvatarURL,
      message.author.tag
    ).then(this._handleStatsResponse.bind(this))
    .catch((error) => {
      logger.error(error);
    });
  }

  getStatsForUserName(message) {
    return FortNite.getStats(message.author.id,
      message.content,
      message.author.displayAvatarURL,
      message.author.tag
    ).then(this._handleStatsResponse.bind(this))
    .catch((error) => {
      logger.error(error);
    });
  }

  _handleStatsResponse(data) {
    if(data && !data.error) {
      this._message.channel.send({
        embed: data['discordRichEmbed']
      });
      UserService.saveUser(this._message.author.id, new User(
        data['fortniteUsername']
      ));
    } else {
      const error = data.error;
      if(error === UserNotFoundError.getMessage()) {
        this._message.reply('Hmmm I couldn\'t find stats for user ' + this._message.author.username + '.  What\'s your FortNite user name?');
        this.addQuestion(this.getStatsForUserName);
        return null;
      } else {
        this._message.reply('Hmmm I seem to be having issues finding your stats, please try again later');
        return null;
      }
    }
  }
}

module.exports = FortNiteConversation;
