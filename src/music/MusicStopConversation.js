const Conversation = require('../conversation/Conversation');
const MusicService = require('../music/MusicService');

class MusicStopConversation extends Conversation {

  constructor(message)  {
    super(message);
    MusicService.stop(message.author.id).then((reply) => {
      this._message.channel.send(reply);
    });
  }

}

module.exports = MusicStopConversation;
