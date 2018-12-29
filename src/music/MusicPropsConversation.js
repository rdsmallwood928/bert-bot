const Conversation = require('../conversation/Conversation');
const MusicService = require('../music/MusicService');

class MusicPropsConversation extends Conversation {

  constructor(message)  {
    super(message);
    MusicService.giveProps(message.author.id,  message.mentions.members).then((reply) => {
      this._message.channel.send(reply);
    });
  }

}

module.exports = MusicPropsConversation;
