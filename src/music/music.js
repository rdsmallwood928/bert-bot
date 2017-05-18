const ytdl = require('ytdl-core');
const logger = require('winston');
const request = require('request');

class MusicRequestHandler {

  //It only plays Lorde...seriously
  constructor(textChannel, voiceChannel, bot, ytApiKey) {
    this.queue = [];
    this.stopped = false;
    this.voiceHandler = null;
    this.bot = bot;
    //Maybe make this configurable
    this.inform = true;
    this.nowPlayingData = {};
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.voiceConnection = null;
    this.ytApiKey = ytApiKey;
    voiceChannel.join().then((connection) => {
      logger.info('Voice connection established');
      this.voiceConnection = connection;
    }).catch(logger.error);
  }

  addToQueue(videoId, message, mute = false) {
    if(this.stopped) {
      this.stopped = false;
    }
    ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId, (error, info) => {
      if(error) {
        message.reply('The requested video (' + videoId + ') does not exist or cannot be played.');
        logger.info('Error (' + videoId + '): ' + error);
      } else {
        this.queue.push({title: info['title'], id: videoId, user: message.author.username});
        if (!mute) {
          message.reply('"' + info['title'] + '" has been added to the queue.');
        }
        if(!this.stopped && !this.isBotPlaying() && this.queue.length === 1) {
          this.playNextSong();
        }
      }
    });
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
      if(this.voiceHandler !== null) {
        this.voiceHandler.end();
      }
      message.reply('Fine, geez...Sorry for appreciating the arts');
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
      this.bot.user.setGame(title);
      this.textChannel.sendMessage('Now playing: "' + title + '" (requested by ' + user + ')');
    }

    const audioStream = ytdl('https://www.youtube.com/watch?v=' + videoId);
    this.getVoiceHandler().then((voiceConnection) => {
      this.voiceHandler = voiceConnection.playStream(audioStream);
      this.voiceHandler.once('end', () => {
        this.voiceHandler = null;
        if(!this.stopped && !this.isQueueEmpty()) {
          this.playNextSong();
        }
      });
    });
    this.queue.splice(0, 1);
  }

  getVoiceHandler() {
    if(this.voiceConnection === null) {
      return setTimeout(this.getVoiceHandler, 1000);
    }
    return Promise.resolve(this.voiceConnection);
  }

  isBotPlaying() {
    this.voiceHandler !== null;
  }
}

module.exports = MusicRequestHandler;
