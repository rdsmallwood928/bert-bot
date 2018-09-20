const DynamoDbService = require('../database/DynamoDbService');
const User = require('./User');

class UserService {

  constructor() {
    this.users = {};
  }

  getUser(userId) {
    if(!this.users.userId) {
      return DynamoDbService.getFortniteUserName(userId).then((userInfo) => {
        if(userInfo) {
          this.users[userInfo.get('user_id')] = new User(
            userInfo.get('fortnite_username'),
            userInfo.get('dj_score')
          );
          return this.users[userInfo.get('user_id')];
        } else {
          return null;
        }
      });
    } else {
      return Promise.resolve(this.users.userId);
    }
  }

  saveUser(discordId, user) {
    if(!this.users['discordId']) {
      DynamoDbService.saveUser(discordId, user);
    }
  }
}

module.exports = new UserService();
