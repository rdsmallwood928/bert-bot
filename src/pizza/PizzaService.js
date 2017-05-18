const PizzaConversation = require('./PizzaConversation');

class PizzaService {

  constructor() {
    this.gettingPizza = {};
  }

  startPizzaOrder(message) {
    if(!this.gettingPizza[message.author.id]) {
      this.gettingPizza[message.author.id] = new PizzaConversation();
      this.gettingPizza[message.author.id].handleConversation(message);
    }
  }

  handleMessage(message) {
    if(this.gettingPizza[message.author.id]) {
      this.gettingPizza[message.author.id].handleConversation(message);
      if(this.gettingPizza[message.author.id].isConversationOver()) {
        delete this.gettingPizza[message.author.id];
      }
    }
  }
}

module.exports = PizzaService;
