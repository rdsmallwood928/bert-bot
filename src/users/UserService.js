const DynamoDbService = require('../database/DynamoDbService');
const User = require('./User');

class UserService {

  constructor() {
    this.users = {};
  }

  getUserByFortnite(userId) {
    if(!this.users.userId) {
      return DynamoDbService.getUser(userId).then((userInfo) => {
        this._createUser(userInfo);
        return this.users[userInfo.get('user_id')];
      });
    } else {
      return Promise.resolve(this.users.userId);
    }
  }

  getUser(discordId) {
    if(!this.users[discordId]) {
      return DynamoDbService.getUser(discordId).then(this._updateUserInfo.bind(this));
    } else {
      return Promise.resolve(this.users[discordId]);
    }
  }

  _updateUserInfo(userModel) {
    if(!userModel) {
      return null;
    }
    this.users[userModel.get('user_id')] = new User(
      userModel.get('fortnite_username'),
      userModel.get('djScore'),
      userModel.get('user_id')
    );
    return this.users[userModel.get('user_id')];
  }

  saveUser(discordId, user) {
    if(!this.users[discordId]) {
      return DynamoDbService.saveUser(discordId, user).then(this._updateUserInfo.bind(this));
    } else {
      const mergedUser =  new User(
        user['fortniteUsername'] || this.users[discordId].getFortniteUserName(),
        user['djScore'] || this.users[discordId].getDjScore()
      );
      return DynamoDbService.saveUser(discordId, mergedUser).then(this._updateUserInfo.bind(this));
    }
  }

  handleMessage(message) {
    this.getUser(message.author.id).then((user) => {
      user.handleMessage(message);
    });
  }

  startConversation(conversation, discordId) {
    this.getUser(discordId).then((user) => {
      if(user) {
        user.startConversation(conversation);
      } else {
        DynamoDbService.saveUser(discordId, new User()).then((user) => {
          this._updateUserInfo(user);
          this.getUser(discordId).then((user) => {
            user.startConversation(conversation);
          });
        });
      }
    });
  }
}

module.exports = new UserService();
