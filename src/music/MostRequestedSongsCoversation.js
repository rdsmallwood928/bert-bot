const Discord = require('discord.js');

const Conversation = require('../conversation/Conversation');
const MusicService = require('../music/MusicService');

class MostRequestedSongsConversation extends Conversation {

  constructor(message)  {
    super(message);
    MusicService.getMostRequestedSongs().then((reply) => {
      let songList = '';
      reply.forEach((song, index) => {
        songList = songList + (index + 1) + '.) ' + song[0] + ' has ' + song[1]  + '\n';
      });
      const discordRichEmbed = new Discord.RichEmbed();
      discordRichEmbed.addField('Most Requested Songs', songList);
      this._message.channel.send({
        embed: discordRichEmbed
      });
    });
  }

}

module.exports = MostRequestedSongsConversation;
