const Discord = require('discord.js');

const Conversation = require('../conversation/Conversation');
const MusicService = require('../music/MusicService');

class MusicPlayListConversation extends Conversation {

  constructor(message)  {
    super(message);
    MusicService.getPlaylist().then((reply) => {
      let playlist = '';
      reply.forEach((song, index) => {
        playlist = playlist + (index + 1) + '.) ' + song + '\n';
      });
      const discordRichEmbed = new Discord.RichEmbed();
      discordRichEmbed.addField('Current Playlist', playlist);
      this._message.channel.send({
        embed: discordRichEmbed
      });
    });
  }

}

module.exports = MusicPlayListConversation;
