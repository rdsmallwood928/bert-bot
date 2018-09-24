class UserNotFoundError {

  constructor() {
    this._message = 'Player Not Found';
  }

  getMessage() {
    return this._message;
  }
}

module.exports = new UserNotFoundError();
