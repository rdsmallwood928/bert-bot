
class Conversation {

  constructor(message) {
    this._questions = [];
    this._message = message;
    this._messageText = message.content.substr(message.content.indexOf(' ') + 1).toLowerCase();
  }

  handleConversation(message) {
    if(message) {
      this._message = message;
    }
    if(!this.isConversationOver) {
      this._questions.shift()(this._message);
    }
  }

  isConversationOver() {
    return this._questions.length === 0;
  }

  addQuestion(question) {
    this._questions.push(question.bind(this));
  }
}

module.exports = Conversation;
