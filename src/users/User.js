
class User {

  constructor(fortniteUsername, djScore) {
    this.fortniteUsername = fortniteUsername;
    this.djScore = djScore;
  }

  getFortniteUserName() {
    return this.fortniteUsername;
  }

}

module.exports = User;
