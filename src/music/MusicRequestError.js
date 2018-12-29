class MusicRequestError {

  constructor() {
    this._message = 'music_request_error';
  }

  getMessage() {
    return this._message;
  }
}

module.exports = new MusicRequestError();
