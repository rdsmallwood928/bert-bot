const ytdl = require('ytdl-core');
const logger = require('winston');
const request = require('request');

class MusicRequestHandler {

  constructor(textChannel, voiceChannel, bot, ytApiKey) {
    this.queue = [];
    this.users = {};
    this.stopped = false;
    this.voiceHandler = null;
    this.bot = bot;
    this.endHandlerId = 0;
    //Maybe make this configurable
    this.inform = true;
    this.nowPlayingData = {};
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.voiceConnection = null;
    this.ytApiKey = ytApiKey;
    this.audioStream = null;
    voiceChannel.join().then((connection) => {
      logger.info('Voice connection established');
      this.voiceConnection = connection;
      this.voiceConnection.player.on('warn', (error) => {
        logger.warn('Unable to play song ' + error);
        setTimeout(() => {
          this.playCurrentStream();
        }, 1000);
      });
    }).catch(logger.error);
    this.playCurrentStream.bind(this);
  }

  playCurrentStream() {
    if(!this.isQueueEmpty()) {
      const endHandler = () => {
        this.voiceHandler.removeListener('end', endHandler);
        this.voiceHandler = null;
        if(!this.stopped && !this.isQueueEmpty()) {
          this.queue.splice(0, 1);
          if(!this.isQueueEmpty()) {
            logger.info('Playing next song after stopping');
            this.playNextSong();
          }
        }
      };
      const handleConnection = (connection) => {
        this.voiceHandler = connection.playStream(this.audioStream);
        this.voiceHandler.on('start', () => {
          this.voiceHandler.on('end', endHandler);
        });
      };
      this.getVoiceConnection().then(handleConnection);
    }
  }

  addToQueue(videoId, message, mute = false) {
    if(this.stopped) {
      this.stopped = false;
    }
    this.addUser(message.author.id);
    ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId, (error, info) => {
      if(error) {
        message.reply('The requested video (' + videoId + ') does not exist or cannot be played.');
        logger.info('Error (' + videoId + '): ' + error);
      } else {
        this.queue.push(
          {
            title: info['title'],
            id: videoId,
            user: message.author.username,
            userId: message.author.id
          }
        );
        if (!mute) {
          message.reply('"' + info['title'] + '" has been added to the queue.');
        }
        if(!this.stopped && !this.isBotPlaying() && this.queue.length === 1) {
          this.playNextSong();
        }
      }
    });
  }

  addUser(userId) {
    if(!this.users[userId]) {
      this.users[userId] = 0;
    }
  }

  giveProps(message) {
    for(const [id, DJ] of message.mentions.members) {
      if(id !== this.bot.user.id) {
        this.addUser(id);
        this.incrementDJScore(id, message);
      }
    }
  }

  incrementDJScore(DJ, message) {
    if(DJ !== message.author.id) {
      this.users[DJ]++;
      message.channel.sendMessage('Nice <@' + DJ + '> you got some mad props.'
      + '  Your DJ score is now ' + this.users[DJ] + '.  https://giphy.com/gifs/rick-and-morty-Zlbrd0nbung9a');
    } else {
      message.reply('Boooo!  Not cool! https://giphy.com/gifs/not-cool-ofA0Y8liucq4w');
    }
  }

  decrementDJScore(listener, DJ, message) {
    if(listener !== DJ) {
      this.users[DJ]--;
      message.channel.sendMessage('Ouch <@' + DJ + '>, looks like wasn\'t a popular pick. '
        + 'Better up your DJ game.  Your current DJ score is ' + this.users[DJ]);
    } else {
      message.reply('No worries, we all make mistakes');
    }
  }

  isQueueEmpty() {
    return this.queue.length === 0;
  }

  searchVideo(message, query) {
    request('https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=' + encodeURIComponent(query.toString().replace(',', ' ')) + '&key=' + this.ytApiKey, (err, res, body) => {
      const json = JSON.parse(body);
      if('error' in json) {
        message.reply('Youtube didn\'t like that one bro...' + json.error.errors[0].message + ' - ' + json.error.errors[0].reason);
      } else if(json.items.length === 0) {
        message.reply('Man you sure thats a song?  I couldn\'t find it on YouTube');
      } else {
        this.addToQueue(json.items[0].id.videoId, message);
      }
    });
  }

  stop(message) {
    if(this.stopped) {
      message.reply('I already did, jerk! Also Lorde is a freaking American treasure and you should appreciate her.');
    } else {
      this.decrementDJScore(message.author.id, this.queue[0].userId, message);
      this.voiceConnection.player.destroyCurrentStream();
    }
  }

  playNextSong() {
    if(this.isQueueEmpty()) {
      this.textChannel.sendMessage('The queue is empty!');
    }

    const videoId = this.queue[0]['id'];
    const title = this.queue[0]['title'];
    const user = this.queue[0]['user'];

    this.nowPlayingData['title'] = title;
    this.nowPlayingData['user'] = user;

    if(this.inform) {
      this.bot.user.setActivity(title);
      this.textChannel.send('Now playing: "' + title + '" (requested by ' + user + ')');
    }

    const audioStream = ytdl('https://www.youtube.com/watch?v=' + videoId);
    this.audioStream = audioStream;
    this.playCurrentStream();
  }

  sendPlaylist(message) {
    if(this.queue.length === 0) {
      message.channel.send('Nothin\' is queued up');
    }
    let playlist = '';
    for(let i = 0; i < this.queue.length; i++) {
      playlist = playlist + (i + 1) + '.) ' + this.queue[i]['title'] + ' requested by '
        + this.queue[i]['user'] + '\n';
    }
    message.channel.send(playlist);
  }

  getVoiceConnection() {
    if(this.voiceConnection === null) {
      return setTimeout(this.getVoiceConnection, 1000);
    }
    return Promise.resolve(this.voiceConnection);
  }

  isBotPlaying() {
    return this.voiceHandler !== null;
  }
}

module.exports = MusicRequestHandler;
