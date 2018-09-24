
class User {

  constructor(fortniteUsername, djScore, discordId) {
    this.fortniteUsername = fortniteUsername;
    this.djScore = djScore;
    this.discordId = discordId;
    this._currentConversation;
  }

  startConversation(conversation) {
    this._currentConversation = conversation;
    this._currentConversation.handleConversation();
  }

  handleMessage(message) {
    this._currentConversation.handleConversation(message);
  }

  getFortniteUserName() {
    return this.fortniteUsername;
  }

  getDjScore() {
    return this.djScore;
  }

  setFortNiteUserName(fortNiteUserName) {
    this.fortniteUsername = fortNiteUserName;
  }

  print() {
    return 'USER: ' +
      'discordId: ' + this.discordId + '\n' +
      'djScore: ' + this.djScore + '\n' +
      'fortniteUsername: ' + this.fortniteUsername;
  }

}
module.exports = User;
