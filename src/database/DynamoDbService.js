const DynamoDb = require('dynamodb');
const Joi = require('joi');
const logger = require('winston');

class DynamoDbService {

  init(awsAccessKeyId, awsSecretAccessKey, awsRegion) {
    DynamoDb.AWS.config.update({
      'accessKeyId': awsAccessKeyId,
      'secretAccessKey': awsSecretAccessKey,
      'region': awsRegion
    });

    this.UserModel = DynamoDb.define('bert_bot_discord_user', {
        hashKey: 'user_id',
        timestamps: true,
        schema: {
          'user_id': Joi.string(),
          'fortnite_username': Joi.string(),
          'djScore': Joi.number()
        }
    });

    DynamoDb.createTables((err) => {
      if(err) {
        logger.info(err);
      } else {
        logger.info('Succesfully connected to dynamodb');
      }
    });
  }

  saveUser(userId, user) {
    return new Promise((resolve, reject) => {
      this.UserModel.create({
        'user_id': userId,
        'fortnite_username': user.getFortniteUserName(),
        'djScore': user.getDjScore()
      }, (err, user) => {
        if(err) {
          logger.error('ERROR SAVING USER NAME FOR ' + userId);
          reject('Could not save user name');
        } else {
          resolve(user);
        }
      });
    });
  }


  getUser(discordId) {
    return new Promise((resolve, reject) => {
      this.UserModel.get(discordId, (err, user) => {
        if(err) {
          logger.error('ERROR GETTING INFO FOR USER');
          reject('ERROR GETTING INFO FOR USER');
        } else {
          resolve(user);
        }
      });
    });
  }
}

module.exports = new DynamoDbService();
