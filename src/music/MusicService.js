const logger = require('winston');
const UserService = require('../users/UserService');
const YouTubeService = require('../youtube/YouTubeService');
const DynamoDbService = require('../database/DynamoDbService');

class MusicService {

  constructor() {
    this.queue = [];
    this.stopped = true;
    this.voiceHandler = null;
    this.endHandlerId = 0;
    //Maybe make this configurable
    this.inform = true;
    this.nowPlayingData = {};
    this.audioStream = null;
    this.BertBotService = null;
  }

  init(BertBotService) {
    logger.info('Initing MusicService');
    BertBotService.getVoiceConnection().then((connection) => {
      connection.player.on('warn', (error) => {
        logger.warn('Unable to play song ' + error);
        setTimeout(() => {
          this.playCurrentStream();
        }, 1000);
      });
    });
    logger.info('Music started');
    this.playCurrentStream.bind(this);
    this.BertBotService = BertBotService;
  }

  playCurrentStream() {
    if(!this.isQueueEmpty()) {
      const endHandler = () => {
        this.voiceHandler.removeListener('end', endHandler);
        this.voiceHandler = null;
        if(!this.stopped && !this.isQueueEmpty()) {
          this.queue.splice(0, 1);
          if(!this.isQueueEmpty()) {
            this.playNextSong();
          } else {
            this.stopped = true;
          }
        } else {
          this.stopped = true;
        }
      };
      const handleConnection = (connection) => {
        this.voiceHandler = connection.playStream(this.audioStream);
        this.voiceHandler.on('start', () => {
          logger.info('Music started');
          this.voiceHandler.on('end', endHandler);
          this.voiceHandler.on('error', (error) => {
            logger.info('!!!!! ' + error);
          });
        });
      };
      this.BertBotService.getVoiceConnection().then(handleConnection);
    }
  }

  addToQueue(videoId, discordId, mute = false) {
    if(this.stopped) {
      this.stopped = false;
    }
    let requester;
    return UserService.getUser(discordId).then((user) => {
      requester = user;
      return YouTubeService.getInfo(videoId);
    }).then((info) => {
    DynamoDbService.addMusicRequestCount(videoId, info['title']);
      this.queue.push(
        {
          title: info['title'],
          id: videoId,
          user: requester.getDiscordId(),
          userId: requester.getDiscordUserName()
        }
      );
      if(!this.stopped && !this.isBotPlaying() && this.queue.length === 1) {
        const response = this.playNextSong();
        if(!mute) {
          return response;
        }
      }
      if (!mute) {
        return '"' + info['title'] + '" has been added to the queue. You can see the queue by @\'ing me with the message \"playlist\"';
      }
    }).catch((error) => {
      logger.error('ERROR RETRIEVING VIDEO INFO FROM YOUTUBE' + error);
    });
  }

  giveProps(requester, members) {
    return new Promise((resolve) => {
      for(const [id] of members) {
        if(id !== this.BertBotService.getBotUserId()) {
          resolve(this.incrementDJScore(id, requester));
        }
      }
    });
  }

  incrementDJScore(DJ, requester) {
    return new Promise((resolve) => {
      if(DJ !== requester) {
        UserService.incrementDjScore(DJ).then((user) => {
          resolve('Nice <@' + DJ + '> you got some mad props.'
          + '  Your DJ score is now ' + user.getDjScore() + '.  https://media.giphy.com/media/26gYOXsPBh3qv420E/giphy.gif');
        });
      } else {
        resolve('Boooo!  Not cool! http://memecrunch.com/meme/9M4AW/boo-not-cool/image.png');
      }
    });
  }

  isQueueEmpty() {
    return this.queue.length === 0;
  }

  searchVideo(message, query) {
    return YouTubeService.getVideoId(query).then((videoId) => {
      return this.addToQueue(videoId, message.author.id);
    });
  }

  stop(stopRequester) {
    return new Promise((resolve) => {
      if(this.stopped) {
        resolve('I already stopped the song, relax!');
      } else {
        const songRequester = this.nowPlayingData.user;
        let reply = '';
        if(songRequester !== stopRequester) {
          UserService.decrementDJScore(songRequester).then((score) => {
            reply = 'Ouch <@' + songRequester + '>, looks like wasn\'t a popular pick. '
            + 'Better up your DJ game.  Your current DJ score is ' + score;
            resolve(reply);
          });
        } else {
          reply = 'No worries, we all make mistakes';
        }
        this.BertBotService.getVoiceConnection().then((connection) => {
          connection.player.destroyCurrentStream();
          resolve(reply);
        });
      }
    });
  }

  playNextSong() {
    if(this.isQueueEmpty()) {
      return 'The queue is empty!';
    }

    const videoId = this.queue[0]['id'];
    const title = this.queue[0]['title'];
    const user = this.queue[0]['user'];

    this.nowPlayingData['title'] = title;
    this.nowPlayingData['user'] = user;

    const audioStream = YouTubeService.getAudioStream(videoId);
    this.audioStream = audioStream;
    this.playCurrentStream();

    if(this.inform) {
      this.BertBotService.setActivity(title);
      return 'Now playing: "' + title + '" (requested by <@' + user + '>)';
    }
  }

  getPlaylist() {
    return new Promise((resolve) => {
      if(this.queue.length === 0) {
        resolve('Nothin\' is queued up');
      }
      const userPromises = this.queue.map((song) => {
        return UserService.getUser(song['user']);
      });
      Promise.all(userPromises).then((users) => {
        resolve(users.map((user, index) => {
          return this.queue[index]['title'] + ' requested by ' + user.getDiscordUserName();
        }));
      });
    });
  }

  isBotPlaying() {
    return this.voiceHandler !== null;
  }

  getMostRequestedSongs() {
    return DynamoDbService.getMostRequestedSongs();
  }
}

module.exports = new MusicService();
