
class User {

  constructor(fortniteUsername, djScore, discordId, discordUserName) {
    this.fortniteUsername = fortniteUsername;
    this.djScore = djScore;
    this.discordId = discordId;
    this.discordUserName = discordUserName;
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

  getDiscordUserName() {
    return this.discordUserName;
  }

  getDjScore() {
    return this.djScore;
  }

  getDiscordId() {
    return this.discordId;
  }

  setDjScore(djScore) {
    this.djScore = djScore;
  }

  setFortNiteUserName(fortNiteUserName) {
    this.fortniteUsername = fortNiteUserName;
  }

  print() {
    return 'USER: ' +
      'discordId: ' + this.discordId + '\n' +
      'djScore: ' + this.djScore + '\n' +
      'fortniteUsername: ' + this.fortniteUsername + '\n' +
      'discordUserName: ' + this.discordUserName;
  }

}
module.exports = User;
