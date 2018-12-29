const FortNite = require('./FortNite');
const Conversation = require('../conversation/Conversation');

class FortNiteDropConversation extends Conversation {

  constructor(message) {
    super(message);
    this.addQuestion(this.getRandomDrop);
  }

  getRandomDrop(message) {
    message.reply(FortNite.getRandomDrop());
  }
}

module.exports = FortNiteDropConversation;
