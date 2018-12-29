const DynamoDbService = require('../database/DynamoDbService');
const User = require('./User');
const logger = require('winston');
const UserNotFoundError = require('./UserNotFoundError');

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
      (userModel.get('djScore') !== null && userModel.get('djScore') !== undefined && !Number.isNaN(userModel.get('djScore'))) ? userModel.get('djScore') : 0,
      userModel.get('user_id'),
      userModel.get('discord_username')
    );
    return this.users[userModel.get('user_id')];
  }

  handleMessage(message) {
    this.getUser(message.author.id).then((user) => {
      user.handleMessage(message);
    });
  }

  startConversation(conversation, discordId, discordUserName) {
    this.getUser(discordId).then((user) => {
      if(user) {
        user.startConversation(conversation);
      } else {
        const newUser = new User(null, 0, discordId, discordUserName);
        this.saveUser(newUser).then((user) => {
          user.startConversation(conversation);
        });
      }
    });
  }

  saveUser(user) {
    return DynamoDbService.saveUser(user.getDiscordId(), user).then((user) => {
      return this._updateUserInfo(user);
    });
  }

  decrementDJScore(discordId) {
    return this.getUser(discordId).then((user) => {
      if(user) {
        const newScore = user.getDjScore() - 1;
        user.setDjScore(newScore);
        this.saveUser(user);
        return newScore;
      }
      throw UserNotFoundError;
    });
  }

  incrementDjScore(discordId) {
    return this.getUser(discordId).then((user) => {
      if(user) {
        const newScore = user.getDjScore() + 1;
        user.setDjScore(newScore);
        this.saveUser(user);
        return user;
      }
      throw UserNotFoundError;
    });
  }
}

module.exports = new UserService();
