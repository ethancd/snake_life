// Generated by CoffeeScript 1.6.3
(function() {
  window.Program = (function() {
    var Game, Life, Snake, bindKeys, bindMouse, modifyStyle, populateBoard, resetInfo, setLayout, setQuality, start;
    Snake = (function() {
      function Snake(game, length) {
        this.game = game;
        this.dir = [0, 1];
        this.nextDir = [0, 1];
        this.buildBody(length);
      }

      Snake.prototype.buildBody = function(length) {
        var startX, startY;
        startY = Math.floor(0.75 * this.game.yDim);
        startX = Math.floor(0.5 * this.game.xDim);
        return this.body = (function() {
          var _results;
          _results = [];
          while ((length -= 1) + 1) {
            _results.push([startY, startX - length]);
          }
          return _results;
        })();
      };

      Snake.prototype.north = function() {
        if (this.dir[0] !== 1) {
          return this.nextDir = [-1, 0];
        }
      };

      Snake.prototype.south = function() {
        if (this.dir[0] !== -1) {
          return this.nextDir = [1, 0];
        }
      };

      Snake.prototype.east = function() {
        if (this.dir[1] !== 1) {
          return this.nextDir = [0, 1];
        }
      };

      Snake.prototype.west = function() {
        if (this.dir[1] !== -1) {
          return this.nextDir = [0, -1];
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

      Snake.prototype.findNext = function() {
        return [this.body[0][0] + this.nextDir[0], this.body[0][1] + this.nextDir[1]];
      };

      Snake.prototype.update = function() {
        var next;
        next = this.findNext();
        if (next.join() === this.game.apple.join()) {
          this.game.addApple();
        } else if (this.game.offscreen(next) || this.has(next) || this.game.life.has(next)) {
          this.game.gameOver();
        } else {
          this.game.life.list[this.body.shift().join()] = true;
        }
        this.dir = this.nextDir;
        return this.body.push(next);
      };

      return Snake;

    })();
    Life = (function() {
      function Life(game) {
        var cell, cells, rPentomino, self, shift, _i, _len;
        this.game = game;
        self = this;
        this.list = {};
        this.activeCells = 5;
        rPentomino = [[-2, 0], [-2, 1], [-1, 0], [0, 0], [-1, -1]];
        cells = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = rPentomino.length; _i < _len; _i++) {
            shift = rPentomino[_i];
            _results.push((function(shift) {
              return [shift[0] + Math.floor(self.game.yDim / 2), shift[1] + Math.floor(self.game.xDim / 2)];
            })(shift));
          }
          return _results;
        })();
        for (_i = 0, _len = cells.length; _i < _len; _i++) {
          cell = cells[_i];
          this.list[cell.join()] = true;
        }
        this.generateCorners();
        $.extend(this.list, this.corners);
      }

      Life.prototype.generateCorners = function() {
        var cell, cells, i, offset, x, xArray, y, yArray, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
        offset = [this.game.xDim / 4 - 2, 0].min;
        this.corners = {};
        _ref = [this.game.yDim - 1, this.game.xDim - 1], y = _ref[0], x = _ref[1];
        _ref1 = [0, 1].concat((function() {
          var _j, _len, _ref1, _results;
          _ref1 = [0, 1];
          _results = [];
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            i = _ref1[_j];
            _results.push(y - offset - i);
          }
          return _results;
        })());
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          i = _ref1[_i];
          yArray = i + offset;
        }
        _ref2 = [0, 1].concat((function() {
          var _k, _len1, _ref2, _results;
          _ref2 = [0, 1];
          _results = [];
          for (_k = 0, _len1 = _ref2.length; _k < _len1; _k++) {
            i = _ref2[_k];
            _results.push(x - offset - i);
          }
          return _results;
        })());
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          i = _ref2[_j];
          xArray = i + offset;
        }
        cells = (function() {
          var _k, _len2, _results;
          _results = [];
          for (_k = 0, _len2 = xArray.length; _k < _len2; _k++) {
            x = xArray[_k];
            _results.push((function(x) {
              var _l, _len3, _results1;
              _results1 = [];
              for (_l = 0, _len3 = yArray.length; _l < _len3; _l++) {
                y = yArray[_l];
                _results1.push([y, x]);
              }
              return _results1;
            })(x));
          }
          return _results;
        })();
        _results = [];
        for (_k = 0, _len2 = cells.length; _k < _len2; _k++) {
          cell = cells[_k];
          _results.push(this.corners[cell.join()] = true);
        }
        return _results;
      };

      Life.prototype.update = function() {
        this.list = this.detectionSweep();
        return this.activeCells = _.size(this.list) - _.size(this.corners);
      };

      Life.prototype.detectionSweep = function() {
        var census, i, j, tempList, _i, _j, _ref, _ref1;
        tempList = {};
        for (i = _i = 0, _ref = this.game.yDim; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          for (j = _j = 0, _ref1 = this.game.xDim; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            census = this.countLiving([i, j]);
            if (census === 3 || (census === 2 && this.has([i, j]))) {
              tempList[[i, j].join()] = true;
            }
          }
        }
        return $.extend(tempList, this.corners);
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
          _results.push([unit[0] + cell[0], unit[1] + cell[1]]);
        }
        return _results;
      };

      Life.prototype.has = function(coord) {
        return this.list[coord.join()];
      };

      return Life;

    })();
    Game = (function() {
      function Game(timeStep, size) {
        this.timeStep = timeStep;
        this.xDim = this.yDim = size;
        this.score = this.potentialScore = this.appleCount = this.turnCount = 0;
        this.scoreMod = Math.pow(Math.pow(20 / size, 1.5) * (300 / this.timeStep), 1.1);
        this.delay = Math.floor(size / 3);
        this.snake = new Snake(this.delay, this);
        this.life = new Life(this);
        this.addApple();
      }

      Game.prototype.update = function() {
        if (this.turnCount > this.delay) {
          this.life.update();
          this.render();
        } else {
          this.life.activeCells = $('.living').length - _.size(this.life.corners);
        }
        this.snake.update();
        this.turnCount += 1;
        return this.score += this.stepUpScore();
      };

      Game.prototype.stepUpScore = function() {
        return Math.ceil(Math.log(this.turnCount * this.life.activeCells * this.scoreMod / 500 + 1));
      };

      Game.prototype.render = function() {
        var i, j, _i, _ref, _results;
        this.potentialScore = this.calculatePotentialScore();
        $(".score").html(" " + this.score);
        $(".potential").html(" + " + this.potentialScore);
        _results = [];
        for (i = _i = 0, _ref = this.yDim; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push((function() {
            var _j, _ref1, _results1;
            _results1 = [];
            for (j = _j = 0, _ref1 = this.xDim; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
              _results1.push(this.updateClass(i, j));
            }
            return _results1;
          }).call(this));
        }
        return _results;
      };

      Game.prototype.addApple = function() {
        var coord;
        while (true) {
          coord = [Math.floor(Math.random() * this.yDim), Math.floor(Math.random() * this.xDim)];
          if (!((this.apple && this.apple.join() === coord.join()) || this.snake.has(coord) || this.life.has(coord))) {
            break;
          }
        }
        this.appleCount += 1;
        this.score += this.potentialScore;
        return this.apple = coord;
      };

      Game.prototype.calculatePotentialScore = function() {
        return _.max([0, Math.floor((10 + this.appleCount) * (this.life.activeCells(-1)) * this.scoreMod)]);
      };

      Game.prototype.updateClass = function(i, j) {
        var $cell, coord;
        $cell = $("#row-" + i + "-col-" + j);
        coord = [i, j];
        $cell.removeClass("water");
        if (this.snake.has(coord)) {
          $cell.addClass("presnake");
          setTimeout((function() {
            return $cell.addClass("snake");
          }), 1);
        } else {
          $cell.removeClass("presnake snake");
        }
        if (this.apple && this.apple.join() === coord.join()) {
          $cell.addClass("apple");
        } else {
          $cell.removeClass("apple");
        }
        if (this.life.has(coord)) {
          $cell.addClass("prelife");
          return setTimeout((function() {
            return $cell.addClass("living");
          }), 1);
        } else {
          return $cell.removeClass("prelife living");
        }
      };

      Game.prototype.offscreen = function(coord) {
        return coord[0] < 0 || coord[0] >= this.yDim || coord[1] < 0 || coord[1] >= this.xDim;
      };

      Game.prototype.gameOver = function() {
        $(".running-score").addClass("gone");
        $(".final-score").removeClass("gone");
        $(".info").removeClass("hidden");
        $("html").off("mousedown").off("keydown");
        return clearInterval(handler);
      };

      Game.prototype.toggleLiving = function(event) {
        var cell, node;
        node = event.target;
        cell = this.getId(node);
        if (this.life.has(cell)) {
          $(node).addClass("water");
          $(node).removeClass("prelife living");
          return delete this.life.list[cell.join()];
        } else {
          $(node).addClass("prelife");
          setTimeout((function() {
            return $(node).addClass("living");
          }), 1, event);
          return this.life.list[cell.join()] = true;
        }
      };

      Game.prototype.getId = function(target) {
        return [parseInt($(target).attr("id").split("-")[1]), parseInt($(target).attr("id").split("-")[3])];
      };

      return Game;

    })();
    start = function(timeStep, size, quality) {
      var game, handler;
      if (typeof game !== "undefined" && game !== null) {
        game.gameOver;
      }
      game = new Game(timeStep, size);
      resetInfo();
      populateBoard(game);
      modifyStyle(game, quality);
      bindMouse(game);
      bindKeys();
      return handler = setInterval((function() {
        game.update();
        return game.render();
      }), timeStep);
    };
    resetInfo = function() {
      $(".info").addClass("hidden");
      $(".final-score").addClass("gone");
      return $(".running-score").removeClass("hidden gone");
    };
    populateBoard = function(game) {
      var i, j, _i, _ref, _results;
      $("ul").html("");
      _results = [];
      for (i = _i = 0, _ref = game.yDim; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (j = _j = 0, _ref1 = game.xDim; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            _results1.push($("ul").append("<li id='row-" + i + "-col-" + j + "'></li>"));
          }
          return _results1;
        })());
      }
      return _results;
    };
    setQuality = function(quality) {
      switch (quality) {
        case "fancy":
          return {
            "@faded": "0.5"
          };
        case "less_fancy":
          return {
            "@faded": "1"
          };
        case "plain":
          $("li").addClass("no-box-shadow");
          return {
            "@faded": "1"
          };
      }
    };
    setLayout = function(game) {
      var _ref;
      return {
        '@snake-fade': game.timeStep * Math.floor(game.xDim / 2) + "ms",
        '@life-fade': game.timeStep * 30 + "ms",
        '@game-size': game.xDim * 30 + "px",
        '@game-margin': _.max([20, (640 - game.xDim * 30) / 2]) + "px",
        '@wrap-width': (_ref = game.xDim <= 20) != null ? _ref : {
          "1000px": game.xDim * 30 + 400 + "px"
        }
      };
    };
    modifyStyle = function(game, quality) {
      return window.less.modifyVars($.extend(setLayout(game), setQuality(quality)));
    };
    bindMouse = function(game) {
      return $("html").on({
        mousedown: function(event) {
          if (event.target.tagName === "LI") {
            game.toggleLiving(event);
          }
          $("li").on({
            mouseenter: function() {
              return game.toggleLiving.bind(game);
            }
          });
          return $("html").on({
            mouseup: function() {
              return $("li").off("mouseenter");
            }
          });
        }
      });
    };
    bindKeys = function() {
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
          }
        }
      });
    };
    return {
      start: start
    };
  })();

}).call(this);
