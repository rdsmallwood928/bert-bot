const ytdl = require('ytdl-core');
const request = require('request-promise-native');
const YouTubeNotFoundError = require('./YouTubeNotFoundError');
const MusicRequestError = require('../music/MusicRequestError');
const MusicNotFoundError = require('../music/MusicNotFoundError');
const logger = require('winston');
const commander = require('../configuration/CommandLineService').getCommander();

class YouTubeService {

  constructor() {
    this._videoUrl = 'https://www.youtube.com/watch?v=';
    this._searchUrl = 'https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=';
    this.ytApiKey = process.env.YOUTUBE || commander.youtubeApi;
  }

  getInfo(videoId) {
    return new Promise((resolve, reject) => {
      ytdl.getInfo(this._videoUrl + videoId, (error, info) => {
        if(error) {
          logger.info('Error (' + videoId + '): ' + error);
          reject(YouTubeNotFoundError);
        } else {
          resolve(info);
        }
      });
    });
  }

  getVideoId(query) {
    return request(this._searchUrl + encodeURIComponent(query.toString().replace(',', ' ')) + '&key=' + this.ytApiKey).then((res) => {
      const json = JSON.parse(res);
      if('error' in json) {
        Promise.reject(MusicRequestError);
      } else if(json.items.length === 0) {
        Promise.reject(MusicNotFoundError);
      } else {
        return json.items[0].id.videoId;
      }
    }).catch((error) => {
      logger.info('ERROR WHEN GETTING VIDEO ID FROM YOUTUBE' + error);
      Promise.reject(MusicRequestError);
    });
  }

  getAudioStream(videoId) {
    return ytdl(this._videoUrl + videoId);
  }

}

module.exports = new YouTubeService();
