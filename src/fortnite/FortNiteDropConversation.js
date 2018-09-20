const FortNite = require('./FortNite');

class FortNiteDropConversation {

  constructor(message) {
    this._message =  message;
    this.handleConversation(message);
  }

  handleConversation(message) {
    message.reply(FortNite.getRandomDrop());
  }
}

module.exports = FortNiteDropConversation;
