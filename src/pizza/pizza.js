const logger = require('winston');
const pizza = require('dominos');

class PizzaService {

  constructor() {
    this.gettingPizza = {};
  }

  startPizzaOrder(message) {
    this.gettingPizza[message.author.id] = true;
    message.reply('Craving some \'za eh?  No prob, first I\'ll need your zip to look up nearby stores');
  }

  handleMessage(message) {
    this.getLocations(message);
  }

  isGettingPizza(id) {
    if(this.gettingPizza[id]) {
      return this.gettingPizza[id];
    }
    return false;
  }

  getLocations(message) {
    logger.info('Getting stores: ' + this.isGettingPizza(message.author.id) + ' ' + JSON.stringify(this.gettingPizza) + ' ' + message.author.id);
    if(this.isGettingPizza(message.author.id)) {
      logger.info('Getting stores for zip ' + message.content);
      pizza.Util.findNearbyStores(
        message.content,
        'Delivery',
        (storeData) => {
          logger.info('Got some stores: ' + JSON.stringify(storeData.result, null, 2));
          let reply = 'Ok here are the stores I found, which one would you like to order from?';
          storeData.result.Stores.forEach((store) => {
            reply = reply + '\n\n ' + store.AddressDescription;
          });
          message.reply(reply);
          this.gettingPizza[message.author.id] = false;
        }
      );
    }
  }
}

module.exports = PizzaService;
