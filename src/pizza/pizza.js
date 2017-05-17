const logger = require('winston');
const pizza = require('pizzapi');

class PizzaService {

  constructor() {}

  startPizzaOrder(message) {
    logger.info(JSON.stringify(message));
    message.reply('Craving some \'za eh?  No prob, first I\'ll need your zip to look up nearby stores');
  }

  getLocations() {
    pizza.Util.findNearbyStores(
        '80122',
        'Delivery',
        (storeData) => {
          logger.info('\n\n##################\nNearby Stores\n##################\n\n', storeData.result.Stores);
        }
    );
  }
}

module.exports = PizzaService;
