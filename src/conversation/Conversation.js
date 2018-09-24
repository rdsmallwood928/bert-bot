
class Conversation {

  constructor(message) {
    this._questions = [];
    this._message = message;
  }

  handleConversation(message) {
    if(message) {
      this._message = message;
    }
    this._questions.shift()(this._message);
  }

  isConversationOver() {
    return this._questions.length === 0;
  }

  addQuestion(question) {
    this._questions.push(question.bind(this));
  }
}

module.exports = Conversation;
