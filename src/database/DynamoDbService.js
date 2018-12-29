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
          'fortnite_username': Joi.string().allow(null),
          'djScore': Joi.number().allow(null),
          'discord_username': Joi.string().allow(null)
        }
    });

    this.MusicModel = DynamoDb.define('bert_bot_requested_song', {
        hashKey: 'song_source',
        rangeKey: 'song_id',
        timestamps: true,
        schema: {
          'song_source': Joi.string(),
          'num_requests': Joi.number(),
          'song_title': Joi.string().allow(null),
          'song_id': Joi.string()
        },
        indexes: [{
            hashKey: 'song_source', rangeKey: 'num_requests', name: 'NumRequestsIndex', type: 'local'
        }]
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
        'djScore': user.getDjScore(),
        'discord_username': user.getDiscordUserName()
      }, (err, user) => {
        if(err) {
          logger.error('ERROR SAVING USER FOR ' + userId);
          reject('Could not save user' + err);
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
          logger.error('ERROR GETTING INFO FOR USER ' + err);
          reject('ERROR GETTING INFO FOR USER');
        } else {
          resolve(user);
        }
      });
    });
  }

  getSongRequestCount(songId) {
    return new Promise((resolve, reject) => {
      this.MusicModel.query('YouTube')
        .where('song_id')
        .equals(songId)
        .exec((err, song) => {
          if(err) {
            logger.error('ERROR GETTING INFO FOR SONG ' + err);
            reject('ERROR GETTING INFO FOR SONG');
          } else {
            if(song.Items) {
              resolve(song.Items);
            } else {
              resolve(null);
            }
          }
        });
    });
  }

  addMusicRequestCount(songId, songTitle) {
    return new Promise((resolve, reject) => {
      this.getSongRequestCount(songId).then((songInfo) => {
        const numRequests = (songInfo.length === 1 && !Number.isNaN(songInfo[0].get('num_requests'))) ? songInfo[0].get('num_requests') + 1 : 1;
        this.MusicModel.create({
          'song_source': 'YouTube',
          'num_requests': numRequests,
          'song_title': songTitle,
          'song_id': songId
        }, (err, song) => {
          if(err) {
            logger.error('ERROR UPDATING REQUEST COUNT FOR: ' + songId);
            reject('ERROR UPDATING REQUEST COUNT');
          } else {
            resolve(song);
          }
        });
      });
    });
  }

  getMostRequestedSongs() {
    return new Promise((resolve, reject) => {
      this.MusicModel.query('YouTube').
        usingIndex('NumRequestsIndex').
        where('num_requests').
        gt(0).
        descending().
        limit(5).
        exec((err, songs) => {
          if(err) {
            reject('ERROR GETTING TOP SONGS');
          }
          resolve(songs.Items.map((song) => {
            return [song.get('song_title'), song.get('num_requests')];
          }));
        });
    });
  }
}

module.exports = new DynamoDbService();
