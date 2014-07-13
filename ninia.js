// Generated by CoffeeScript 1.7.1
(function() {
  window.Program = (function() {
    var $find, Game, Life, Snake, bindKeys, bindMouse, populateBoard, resetInfo, start;
    start = function() {
      if (typeof game !== "undefined" && game !== null) {
        game.gameOver();
      }
      resetInfo();
      populateBoard(16);
      window.game = new Game(16);
      bindMouse(game);
      return bindKeys(game);
    };
    resetInfo = function(music) {
      return $(".running-score").removeClass("hidden gone");
    };
    populateBoard = function(size) {
      var $board, i, j, _i, _results;
      $board = $("#board");
      $board.html("");
      _results = [];
      for (i = _i = 0; 0 <= size ? _i < size : _i > size; i = 0 <= size ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (j = _j = 0; 0 <= size ? _j < size : _j > size; j = 0 <= size ? ++_j : --_j) {
            _results1.push($board.append("<li id='row-" + i + "-col-" + j + "'></li>"));
          }
          return _results1;
        })());
      }
      return _results;
    };
    bindMouse = function(game) {
      return $("html").on("mousedown", function(event) {
        if (event.target.tagName === "LI") {
          game.toggleLiving(event);
          return game.timelessUpdate();
        }
      });
    };
    bindKeys = function(game) {
      return $('html').on({
        keydown: function(event) {
          switch (event.keyCode) {
            case 38:
            case 87:
              return game.snake.north();
            case 37:
            case 65:
              return game.snake.west();
            case 40:
            case 83:
              return game.snake.south();
            case 39:
            case 68:
              return game.snake.east();
            case 32:
              return game.toggleTime();
          }
        }
      });
    };
    $find = function(coord) {
      return $("#row-" + coord[0] + "-col-" + coord[1]);
    };
    Snake = (function() {
      function Snake(game, length) {
        this.game = game;
        this.dir = [0, 1];
        this.nextDir = [0, 1];
        this.buildBody(length);
      }

      Snake.prototype.buildBody = function(length) {
        var i, startX, startY;
        startY = 12;
        startX = 6;
        i = -1;
        return this.body = (function() {
          var _results;
          _results = [];
          while (i++ < length) {
            _results.push([startY, startX - i]);
          }
          return _results;
        })();
      };

      Snake.prototype.north = function() {
        if (this.dir[0] !== 1) {
          this.nextDir = [-1, 0];
          return this.game.timelessUpdate();
        }
      };

      Snake.prototype.south = function() {
        if (this.dir[0] !== -1) {
          this.nextDir = [1, 0];
          return this.game.timelessUpdate();
        }
      };

      Snake.prototype.east = function() {
        if (this.dir[1] !== -1) {
          this.nextDir = [0, 1];
          return this.game.timelessUpdate();
        }
      };

      Snake.prototype.west = function() {
        if (this.dir[1] !== 1) {
          this.nextDir = [0, -1];
          return this.game.timelessUpdate();
        }
      };

      Snake.prototype.has = function(coord) {
        var part, _i, _len, _ref;
        _ref = this.body;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          part = _ref[_i];
          if (coord.join() === part.join()) {
            return true;
          }
        }
        return false;
      };

      Snake.prototype.getNext = function() {
        return [this.game.wrap(this.body[0][0] + this.nextDir[0]), this.game.wrap(this.body[0][1] + this.nextDir[1])];
      };

      Snake.prototype.update = function() {
        var next;
        next = this.getNext();
        if (this.has(next) || this.game.life.has(next)) {
          this.game.gameOver();
        } else if ((this.game.apple != null) && next.join() === this.game.apple.join()) {
          $find(next).removeClass("apple");
          this.game.addApple();
        } else {
          this.game.life.list[this.body.pop().join()] = true;
        }
        this.dir = this.nextDir;
        return this.body.unshift(next);
      };

      return Snake;

    })();
    Life = (function() {
      function Life(game) {
        this.game = game;
        this.list = {};
      }

      Life.prototype.patterns = {
        glider: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
        rPentonimo: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
        shortTable: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2]]
      };

      Life.prototype.pickPattern = function() {
        var randomIndex;
        randomIndex = Math.floor(Math.random() * _.size(this.patterns));
        return _.values(this.patterns)[randomIndex];
      };

      Life.prototype.update = function() {
        this.list = this.detectionSweep();
        if (this.notActiveEnough()) {
          return this.addDeNovoPattern();
        }
      };

      Life.prototype.detectionSweep = function() {
        var census, i, j, tempList, _i, _j, _ref, _ref1;
        tempList = {};
        for (i = _i = 0, _ref = this.game.size; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          for (j = _j = 0, _ref1 = this.game.size; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            census = this.countLiving([i, j]);
            if (census === 3 || (census === 2 && this.has([i, j]))) {
              tempList[[i, j].join()] = true;
            }
          }
        }
        return tempList;
      };

      Life.prototype.notActiveEnough = function() {
        return _.size(this.list) < 5 + (this.game.boringTurnStreak / 5);
      };

      Life.prototype.addDeNovoPattern = function() {
        var cell, cells, coord, shift, _i, _len;
        while (true) {
          coord = [Math.floor(Math.random() * this.game.size), Math.floor(Math.random() * this.game.size)];
          if (!this.game.near(coord, this.game.snake.body[0], 6)) {
            break;
          }
        }
        cells = (function() {
          var _i, _len, _ref, _results;
          _ref = this.pickPattern();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            shift = _ref[_i];
            _results.push((function(shift) {
              return [shift[0] + coord[0], shift[1] + coord[1]];
            })(shift));
          }
          return _results;
        }).call(this);
        for (_i = 0, _len = cells.length; _i < _len; _i++) {
          cell = cells[_i];
          this.list[cell.join()] = true;
        }
        return this.game.boringTurnStreak = 0;
      };

      Life.prototype.countLiving = function(cell) {
        var nabe;
        return ((function() {
          var _i, _len, _ref, _results;
          _ref = this.neighbors(cell);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            nabe = _ref[_i];
            if (this.has(nabe)) {
              _results.push(nabe);
            }
          }
          return _results;
        }).call(this)).length;
      };

      Life.prototype.neighbors = function(cell) {
        var unit, units, _i, _len, _results;
        units = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        _results = [];
        for (_i = 0, _len = units.length; _i < _len; _i++) {
          unit = units[_i];
          _results.push([this.game.wrap(unit[0] + cell[0]), this.game.wrap(unit[1] + cell[1])]);
        }
        return _results;
      };

      Life.prototype.has = function(coord) {
        return this.list[coord.join()];
      };

      return Life;

    })();
    Game = (function() {
      function Game(size) {
        this.size = size;
        this.score = this.appleCount = 0;
        this.framesPerMinute = 1;
        this.timeless = true;
        this.$cells = $('li');
        this.snake = new Snake(this, 5);
        this.life = new Life(this);
        this.addApple();
        this.render();
      }

      Game.prototype.toggleTime = function() {
        this.timeless = !this.timeless;
        if (!this.timeless) {
          return this.rampUpRunning;
        }
      };

      Game.prototype.timelessUpdate = function() {
        if (this.timeless) {
          return this.update();
        }
      };

      Game.prototype.rampUpRunning = function() {};

      Game.prototype.update = function() {
        this.life.update();
        this.snake.update();
        this.render();
        this.turnCount += 1;
        return this.boringTurnStreak += 1;
      };

      Game.prototype.render = function() {
        $(".score").html(" " + this.score);
        return this.updateClass();
      };

      Game.prototype.addApple = function() {
        var coord;
        while (true) {
          coord = [Math.floor(Math.random() * this.size), Math.floor(Math.random() * this.size)];
          if (!(((this.apple != null) && this.apple.join() === coord.join()) || this.snake.has(coord) || this.life.has(coord))) {
            break;
          }
        }
        this.score += this.getAddedScore();
        this.appleCount += 1;
        this.apple = coord;
        this.boringTurnStreak = 0;
        return $find(this.apple).addClass("apple");
      };

      Game.prototype.getAddedScore = function() {
        var timeMod;
        timeMod = Math.pow(this.getTimeModifier(), 2) + 1;
        return Math.pow(Math.floor(this.appleCount * timeMod), 2);
      };

      Game.prototype.getTimeModifier = function() {
        if (this.timeless) {
          return 0;
        } else {
          return this.framesPerMinute;
        }
      };

      Game.prototype.updateClass = function() {
        var cell, cellArr, coord, _i, _len, _ref, _results;
        this.$cells.removeClass("water");
        this.$cells.removeClass("snake");
        this.$cells.removeClass("living");
        _ref = this.$cells;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          cellArr = cell.id.split("-");
          coord = [parseInt(cellArr[1]), parseInt(cellArr[3])];
          if (this.snake.has(coord)) {
            $(cell).addClass("snake");
          }
          if (this.life.has(coord)) {
            _results.push($(cell).addClass("living"));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Game.prototype.gameOver = function() {
        $("html").off("mousedown").off("keydown");
        if (window.handler != null) {
          clearInterval(handler);
        }
        return window.game = null;
      };

      Game.prototype.toggleLiving = function(event) {
        var cell, node;
        node = event.target;
        cell = this.getId(node);
        if (this.life.has(cell)) {
          this.kill(node, cell);
          return this.timelessUpdate;
        }
      };

      Game.prototype.kill = function(node, cell) {
        if (this.life.has(cell)) {
          $(node).addClass("water");
          $(node).removeClass("living");
          return delete this.life.list[cell.join()];
        }
      };

      Game.prototype.wrap = function(value) {
        if (value < 0) {
          return this.size - 1;
        } else if (value >= this.size) {
          return 0;
        } else {
          return value;
        }
      };

      Game.prototype.getId = function(target) {
        return [parseInt($(target).attr("id").split("-")[1]), parseInt($(target).attr("id").split("-")[3])];
      };

      Game.prototype.near = function(cellA, cellB, distance) {
        return Math.abs(cellA[0] - cellB[0]) % (this.size / 2) < distance || Math.abs(cellA[1] - cellB[1]) % (this.size / 2) < distance;
      };

      return Game;

    })();
    return {
      start: start
    };
  })();

}).call(this);
