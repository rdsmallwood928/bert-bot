const Random = require('random-js');

class FortNight {

  constructor() {
    this.engine = Random.engines.mt19937();
    this.engine.seed(Date.now());
    this.dropLocations = [
      'Haunted Hills',
      'Junk Junction',
      'Loot Lake',
      'Pleasant Park',
      'Snobby Shores',
      'Tilted Towers',
      'Flush Factory',
      'Greasy Grove',
      'Lucky Landing',
      'Shifty Shafts',
      'Fatal Fields',
      'Moisty Mire',
      'Retail Row',
      'Salty Springs',
      'Anarchy Acres',
      'Dusty Depot',
      'Lonely Lodge',
      'Tomato Town',
      'Wailing Woods'
    ];
  }

  getRandomDrop(message) {
    message.reply(Random.pick(this.engine, this.dropLocations));
  }

}

module.exports = FortNight;
