var HummingbirdAnimeList = (function($, _, localStorage, Storage) {
  if (HummingbirdAccessToken === null || _ === null) {
    console.log('Error loading script');
    return;
  }

  if (typeof(Storage) === 'undefined' || typeof(localStorage) === undefined) {
    console.log('localStorage is not defined!');
    return;
  }

  /**
   * @class Animelist
   * @param {string} username the username of the anime list
   */
  function Animelist(username, callback) {
    this.username = username;
    this.access_token = null;
    this.anime_list = null;
    this.favorite_anime = null;
    var _this = this;
    this._loadList(function(err) { // asynchronously retrive anime list
      if (err) {
        return callback(err);
      }
      _this._loadFavoriteAnime(callback); // asynchronously retrive user's favorite anime
    }); 
  }
  
  /**
   * Retrieves the anime list data from hummingbird
   * @param {function(err)} callback called once finished getting the list
   */
  Animelist.prototype._loadList = function(callback) {
    var _callback = callback;
    $.ajax({
      type: 'GET',
      url: 'http://hummingbird.me/api/v1/users/' + this.username + '/library',
      success: function(data, textStatus, jqXHR) {
        this.anime_list = data;
        localStorage.setItem('animelist-cached:' + this.username, JSON.stringify(this.anime_list)); // TODO: call this in webworker
        if (_callback) {
          _callback(null);
        }
      }.bind(this),
      error: function(jqXHR, textStatus, error) {
        this.anime_list = JSON.parse(localStorage.getItem('animelist-cached:' + this.username)); // TODO: call this in webworker
        if (_callback) {
          _callback(error);
        }
      }.bind(this)
    });
  };

  /**
   * Retrives the user's favorite anime from hummingbird
   * @param {function(err)} callback called once finished
   */
  Animelist.prototype._loadFavoriteAnime = function(callback) {
    var _callback = callback;
    $.ajax({
      type: 'GET',
      url: 'http://hummingbird.me/api/v1/users/' + this.username + '/favorite_anime',
      success: function(data, textStatus, jqXHR) {
        this.favorite_anime = data;
        localStorage.setItem('anime-cached:' + this.username+':favorite', JSON.stringify(this.favorite_anime));
        if (_callback) {
          _callback(null);
        }
      }.bind(this),
      error: function(jqXHR, textStatus, error) {
        this.favorite_anime = JSON.parse(localStorage.getItem('anime-cached:' + this.username + ':favorite'));
        if (_callback) {
          _callback(error);
        }
      }.bind(this)
    });
  };

  Animelist.prototype.getList = function getAll() {
    return this.anime_list;
  };

  /**
   * Removes the anime from the user's anime list
   * @param {string} animeid the id of the anime to remove
   * @param {function(err)} callback called when completed
   */
  Animelist.prototype.removeFromList = function removeFromList(animeid, callback) {
    var access_token = GLOBAL_ACCESS_TOKEN.getAccessToken();

    if (access_token === null) {
      return callback(new Error('You are not authorized to perform this action'));
    }

    $.ajax({
      type: 'POST', 
      url: 'https://hummingbird.me/api/v1/libraries/' + animeid + '/remove',
      data: {
        auth_token: access_token
      },
      success: function() {
        return callback(null);
      },
      statusCode: {
        401: function() {
          return callback(new Error('You are not authorized to perform this action'));
        },
        500: function() {
          return callback(new Error('There was an internal server error'));
        }
      },
    });
  };

  /**
   * @param {string} animeid id of anime to update
   * @param {Object} updateparams parameters to update
   * @property {string?} updateparams.status updated status of the anime
   * @property {boolean?} updateparams.privacy updated privacy of the anime
   * @property {double?} updateparams.rating updated rating of the anime
   * @property {boolean?} updateparams.rewatching updated if watching or not
   * @property {integer?} updateparams.rewatched_times updated number of rewatched times
   * @property {string?} updateparams.notes updated notes
   * @property {integer?} updateparams.episodes_watched updated watched episodes
   * @property {boolean?} updateparams.increment_episodes if true, increment the episodes
   * @param {function(err, LibraryItem)} callback called after finishing
   */
  Animelist.prototype.update = function update(animeid, updateparams, callback) {
    var access_token = GLOBAL_ACCESS_TOKEN.getAccessToken();
    if (access_token === null) {
      return callback(new Error('You are not authorized to perform this action'));
    }

    var params = _.pick(updateparams, 'status', 'privacy', 'rating', 'rewatching', 
                        'rewatched_times', 'notes', 'episodes_watched', 'increment_episodes', 'sane_rating_update');

    _.extend(params, { id: animeid, auth_token: access_token });

    $.ajax({
      type: 'POST',
      url: 'https://hummingbird.me/api/v1/libraries/' + animeid,
      data: params,
      success: function(data, textStatus, jqXHR) {
        return callback(null, data);
      }.bind(this),
      statusCode: {
        401: function() {
          return callback(new Error('You are not authorized to perform this action'));
        },
        500: function() {
          return callback(new Error('There was an internal server error'));
        }
      }
    });
  };

  /**
   * @param {string} query
   * @param {function(err, Array.<Anime>)} callback
   */
  Animelist.search = function search(query, callback) {
    $.ajax({
      type: 'GET',
      url: 'http://hummingbird.me/api/v1/search/anime?query=' + query.split(' ').join('+'),
      success: function(data, textStatus, jqXHR) {
        return callback(null, data);
      }.bind(this)
    });
  };

  return Animelist;
}) (jQuery, _, localStorage, Storage);