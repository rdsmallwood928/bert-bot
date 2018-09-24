const Conversation = require('../conversation/Conversation');
const UserService = require('../users/UserService');

class FortNiteUserNameUpdateConversation extends Conversation {

  constructor(message) {
    super(message);
    this.addQuestion(this.askForUserName);
  }

  askForUserName() {
    this.addQuestion(this.setNewUserName);
    this._message.reply('Ok, whats your new FortNite username?');
  }

  setNewUserName() {
    UserService.getUser(this._message.author.id).then((user) => {
      user.setFortNiteUserName(this._message.content);
      return UserService.saveUser(this._message.author.id, user);
    }).then((user) => {
      this._message.reply('Nice! FortNite user name updated to: ' + user.getFortniteUserName());
    });
  }

}

module.exports = FortNiteUserNameUpdateConversation;
