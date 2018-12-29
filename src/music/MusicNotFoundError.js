class MusicNotFoundError {

  constructor() {
    this._message = 'music_not_found';
  }

  getMessage() {
    return this._message;
  }
}

module.exports = new MusicNotFoundError();
