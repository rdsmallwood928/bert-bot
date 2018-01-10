const logger = require('winston');
const pizza = require('dominos');

class PizzaConversation {

  constructor() {
    this.pizzaQuestions = [];
    this.pizzaQuestions.push(this.startPizzaOrder.bind(this));
    this.pizzaQuestions.push(this.getLocations.bind(this));
    this.pizzaQuestions.push(this.getSpecials.bind(this));
    this.pizzaQuestions.push(this.handleOrderItem.bind(this));
    this.printCategory.bind(this);
    this.storeIndex = 0;
    this.store = null;
    this.storeData = null;
    this.order = new pizza.Order();
    this.haveAskedToConfirmStore = false;
  }

  startPizzaOrder(message) {
    message.reply('Craving some \'za eh?  No prob, first I\'ll need your zip to look up nearby stores');
  }

  handleConversation(message) {
    this.pizzaQuestions[0](message);
    this.pizzaQuestions.splice(0, 1);
  }

  isConversationOver() {
    return this.pizzaQuestions.length === 0;
  }

  //TODO clean this method up...holy cow its late
  confirmStore(message) {
    let reply = 'Uhhhhhhhhh...';
    if(message.content.toLowerCase().includes('yes') && this.haveAskedToConfirmStore) {
      this.store = new pizza.Store(
        {ID: this.storeData.result.Stores[this.storeIndex].StoreID}
      );
      reply = 'Nice! Do you want to hear the specials?';
    } else if(!this.haveAskedToConfirmStore) {
      reply = 'Ok, I think this is the store you should order from: ';
      reply = reply + '\n\n' + this.storeData.result.Stores[this.storeIndex].AddressDescription + '\n\n';
      reply = reply + 'Sound good?';
      this.haveAskedToConfirmStore = true;
      this.pizzaQuestions.unshift(this.confirmStore.bind(this));
    } else if(this.storeIndex + 1 < this.storeData.result.Stores.length) {
      this.storeIndex = this.storeIndex + 1;
      reply = 'Damn, could it be this one?';
      reply = reply + '\n\n' + this.storeData.result.Stores[this.storeIndex].AddressDescription + '\n\n';
      this.pizzaQuestions.unshift(this.confirmStore.bind(this));
    } else {
      reply = 'Thats all the stores I could find my hungry amigo.  Can you give me any more address info? (The more address info I have, the more accurate my searches are)';
      this.haveAskedToConfirmStore = false;
      this.storeIndex = 0;
      this.pizzaQuestions.unshift(this.getLocations.bind(this));
    }
    message.reply(reply);
  }

  printCategory(showItems, category, depth) {
    let specials = '';
    if (!depth) {
      depth = 0;
    }
    const indent = Array(depth + 1).join(' ');
    specials = indent + category.getName();
    for (let subIndex in category.getSubcategories()) {
      specials = specials + this.printCategory(showItems, category.getSubcategories()[subIndex], depth + 1);
    }
    if (showItems) {
      category.getProducts().forEach((product) => {
        specials = specials + indent + product.getName();
      });
    }
    return specials;
  }

  getSpecials(message) {
    let reply = 'Doh!';
    if(message.content.toLowerCase().includes('yes') || message.content.toLowerCase().includes('sure')) {
      reply = 'Nice, here\'s the specials';
      this.store.getMenu((menu) => {
        message.reply('Nice, here are the specials');
        reply = this.printCategory(true, menu.getCouponCategory(), 1);
        let startIndex = 0;
        let endIndex = 0;
        for(let index = 0; index < reply.length; index++) {
          if(index % 1000 === 0 && index !== 0) {
            logger.info('Replying: ' + reply.substring(startIndex, endIndex).length);
            message.reply(reply.substring(startIndex, endIndex));
            startIndex = endIndex;
          }
          endIndex = index;
        }
        message.reply(reply.substring(startIndex, endIndex + 1));
      });
    } else {
      message.reply(reply);
    }
  }

  orderConfirmation(message) {
    if(message.content.toLowerCase().includes('yes')) {
      message.reply('Ok let me submit that for you');
    } else {
      message.reply('Ok, lets start over');
      this.order = new pizza.Order();
      this.pizzaQuestions.push(this.handleOrderItem.bind(this));
    }
  }

  handleOrderItem(message) {
    if(message.content.toLowerCase().includes('no more and then')
      || message.content.toLowerCase().includes('that\'s all')) {
      message.reply('Ok got your order: \n' + this.printOrder(this.order) + 'Looks good?');
      this.pizzaQuestions.push(this.orderConfirmation.bind(this));
    } else {
      this.order.addItem(new pizza.Item({
            code: message.content,
            options: [],
            quantity: 1
      }));
      this.pizzaQuestions.push(this.handleOrderItem.bind(this));
      message.reply('And then...');
    }
  }

  printOrder(order) {
    const orderItems = order.Products;
    let orderString = '';
    for(let item of orderItems) {
      logger.info(JSON.stringify(item, null, 2));
      orderString = orderString + item.Qty + ' ' + item.Code + '\n';
    }
    return orderString;
  }

  getLocations(message) {
    const handleStoreData = (storeData) => {
      if(storeData.success && storeData.result.Stores.length > 0) {
        this.storeData = storeData;
        this.confirmStore(message);
      } else {
        message.reply('I couldn\'t find any stores for the info: ' + message.content + '.  Just tell me your zip code instead');
        this.pizzaQuestions.unshift(this.getLocations.bind(this));
      }
    };
    handleStoreData.bind(this);
    pizza.Util.findNearbyStores(
      message.content,
      'Delivery',
      handleStoreData
    );
  }
}

module.exports = PizzaConversation;
