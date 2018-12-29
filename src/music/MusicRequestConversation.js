const MusicService = require('./MusicService');
const Conversation = require('../conversation/Conversation');
const MusicNotFoundError = require('./MusicNotFoundError');
const MusicRequestError = require('./MusicRequestError');

class MusicRequestConversation extends Conversation {

  constructor(message) {
    super(message);
    MusicService.searchVideo(this._message, this._messageText.split(' ').slice(1)).then((response) => {
      message.channel.send(response);
    }).catch((error) => {
      if(MusicNotFoundError.getMessage() === error.getMessage()) {
        message.reply('Man you sure thats a song?  I couldn\'t find it on YouTube');
      } else if(MusicRequestError.getMessage() === error.getMessage()) {
        message.reply('Youtube didn\'t like that one bro...maybe try again and change the request a bit');
      } else {
        message.reply('Uhhhh does not compute (Something went seriously wrong...)');
      }
    });
  }
}

module.exports = MusicRequestConversation;
