const logger = require('winston');
const pizza = require('pizzapi');

class PizzaService {

  constructor() {}

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
