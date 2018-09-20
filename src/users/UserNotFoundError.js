class UserNotFoundError {

  constructor() {
    this._message = 'PlayerNotFoundError';
  }

  getMessage() {
    return this._message;
  }
}

module.exports = new UserNotFoundError();
