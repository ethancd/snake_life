// Generated by CoffeeScript 1.7.1
(function() {
  window.Program = (function() {
    var $find, Game, Life, Snake, bindKeys, bindMouse, populateBoard, resetInfo, runIntro, showGameOverScreen, showInstructions, spanify, start;
    start = function() {
      if (typeof game !== "undefined" && game !== null) {
        return;
      }
      resetInfo();
      populateBoard(16);
      window.game = new Game(16);
      bindMouse(game);
      bindKeys(game);
      if (window.returningPlayer) {
        $('#modal').hide();
        $('#new-game').hide();
        return $('#modal').find('.message').removeClass('game-over');
      } else {
        return runIntro();
      }
    };
    resetInfo = function() {
      return $(".score").text("0");
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
    runIntro = function() {
      window.invincible = window.returningPlayer = true;
      return setTimeout(function() {
        return showInstructions(0);
      }, 1);
    };
    showInstructions = function(slideNumber) {
      var $modal, instructions;
      $modal = $('#modal');
      instructions = ["Press W-A-S-D or ↑ ← ↓ → to move", "Don't let your " + (spanify('head', 'snake')) + " run into the " + (spanify('flames', 'fire')) + " (bumping into your " + (spanify('body', 'snake')) + " isn't fatal, and edges are okay, you just wrap around)", "Click and drag to douse " + (spanify('flames', 'fire')) + ", but watch your " + (spanify('water', 'water')) + " supply", "Have fun, eat " + (spanify('apples', 'apple')) + ", and don't die!"];
      if (!instructions[slideNumber]) {
        window.invincible = false;
        $('html').off("keyup.intro click.intro");
        $modal.css({
          'opacity': 0
        });
        $modal.hide();
        return;
      }
      $modal.find('.message').html(instructions[slideNumber]);
      $modal.css({
        'opacity': 1
      });
      return setTimeout(function() {
        return $('html').on({
          "keyup.intro click.intro": function() {
            $modal.css({
              'opacity': 0
            });
            return setTimeout(function() {
              $('html').off("keyup.intro click.intro");
              return showInstructions(slideNumber + 1);
            }, 1000);
          }
        });
      }, 1000);
    };
    spanify = function(text, klass) {
      return "<span class='" + klass + "'>" + text + "</span>";
    };
    showGameOverScreen = function() {
      var $modal, $newGameButton, gameOverMessage;
      $modal = $("#modal");
      $newGameButton = $('#new-game');
      gameOverMessage = "&#9760; Game Over! &#9760;";
      $modal.css({
        'opacity': 0
      });
      $modal.show();
      return setTimeout(function() {
        $modal.find('.message').addClass('game-over').html(gameOverMessage);
        $modal.css({
          'opacity': 1
        });
        return $newGameButton.show();
      }, 1);
    };
    bindMouse = function(game) {
      return $("html").on("mousedown", function(event) {
        event.preventDefault();
        if (event.target.tagName === "BUTTON") {
          switch ($(event.target).attr('id')) {
            case "up":
              game.snake.north();
              break;
            case "left":
              game.snake.west();
              break;
            case "down":
              game.snake.south();
              break;
            case "right":
              game.snake.east();
          }
        }
        if (event.target.tagName === "LI") {
          game.wash(event);
        }
        $("li").on("mouseenter", game.wash.bind(game));
        return $("html").on("mouseup", function() {
          return $("li").off("mouseenter");
        });
      });
    };
    bindKeys = function(game) {
      return $('html').on({
        keydown: function(event) {
          var _ref;
          if ((_ref = event.keyCode) === 32 || _ref === 37 || _ref === 38 || _ref === 39 || _ref === 40 || _ref === 65 || _ref === 68 || _ref === 83 || _ref === 87 || _ref === 191) {
            event.preventDefault();
          }
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
              return game.toggleMotion();
            case 191:
              return game.toggleGuide();
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
        this.body = (function() {
          var _results;
          _results = [];
          while (i++ <= length) {
            _results.push([startY, startX - i]);
          }
          return _results;
        })();
        $find(this.body[0]).addClass("head");
        this.torch = this.body.pop();
        return this.game.life.list[this.torch.join()] = "supertrue";
      };

      Snake.prototype.north = function() {
        if (this.dir[0] !== 1) {
          this.nextDir = [-1, 0];
          if (!this.game.inMotion) {
            return this.game.update();
          }
        }
      };

      Snake.prototype.south = function() {
        if (this.dir[0] !== -1) {
          this.nextDir = [1, 0];
          if (!this.game.inMotion) {
            return this.game.update();
          }
        }
      };

      Snake.prototype.east = function() {
        if (this.dir[1] !== -1) {
          this.nextDir = [0, 1];
          if (!this.game.inMotion) {
            return this.game.update();
          }
        }
      };

      Snake.prototype.west = function() {
        if (this.dir[1] !== 1) {
          this.nextDir = [0, -1];
          if (!this.game.inMotion) {
            return this.game.update();
          }
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
        var isShiny, next;
        next = this.getNext();
        if (this.has(next)) {
          if (!window.invincible && this.game.life.has(this.body[0])) {
            this.game.gameOver();
          } else {
            this.game.life.list[this.torch.join()] = "supertrue";
          }
          return;
        }
        if (!window.invincible && this.game.life.has(next)) {
          this.game.gameOver();
        } else if ((this.game.apple != null) && next.join() === this.game.apple.join()) {
          $find(next).removeClass("apple");
          this.game.addApple();
        } else {
          this.torch = this.body.pop();
        }
        this.game.life.list[this.torch.join()] = "supertrue";
        isShiny = $find(this.body[0]).hasClass("shiny");
        $find(this.body[0]).removeClass("head shiny");
        $find(next).addClass("head").toggleClass("shiny", isShiny);
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
        shortTable: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2]],
        zHexomino: [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],
        stairstepHexomino: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]],
        blockAndGlider: [[0, 0], [0, 1], [1, 0], [1, 2], [2, 2], [2, 3]],
        century: [[0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [2, 1]],
        thunderbird: [[0, 0], [0, 1], [0, 2], [2, 1], [3, 1], [4, 1]],
        herschelParent: [[0, 2], [1, 0], [1, 1], [2, 2], [2, 4], [3, 4]]
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
              return [this.game.wrap(shift[0] + coord[0]), this.game.wrap(shift[1] + coord[1])];
            })(shift));
          }
          return _results;
        }).call(this);
        for (_i = 0, _len = cells.length; _i < _len; _i++) {
          cell = cells[_i];
          this.list[cell.join()] = "supertrue";
        }
        return this.game.boringTurnStreak = this.game.appleCount;
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
        this.score = this.turnCount = this.washCount = this.appleCount = 0;
        this.$cells = $('li');
        this.waterLevel = this.tankSize = 5;
        this.frameRate = 500;
        this.life = new Life(this);
        this.snake = new Snake(this, 5);
        this.recentGuiding = this.recentStopping = this.guide = this.inMotion = false;
        $('h1').add('title').text("Snake on Fire");
        this.startRunLoop();
        this.addApple();
        this.render();
      }

      Game.prototype.startRunLoop = function() {
        if (window.gameLoop != null) {
          clearInterval(window.gameLoop);
        }
        return window.gameLoop = setInterval((function(_this) {
          return function() {
            if (!_this.inMotion) {
              return;
            }
            return _this.update();
          };
        })(this), this.frameRate);
      };

      Game.prototype.update = function() {
        if (!this.inMotion) {
          $("li").off("mouseenter");
        }
        this.turnCount += 1;
        this.boringTurnStreak += 1;
        if (this.turnCount % 3 === 0 || this.inMotion) {
          this.waterLevel = _.min([this.waterLevel + 1, this.tankSize]);
        }
        this.life.update();
        this.snake.update();
        return this.render();
      };

      Game.prototype.render = function() {
        this.updateScores();
        this.renderWaterTank();
        this.updateClass();
        return this.flamePreview();
      };

      Game.prototype.toggleMotion = function() {
        var title;
        this.inMotion = !this.inMotion;
        if (this.inMotion) {
          title = "Snake on Fire!";
          if (!this.recentStopping) {
            $find(this.snake.body[0]).addClass("shiny");
          }
        } else {
          title = "Snake on Fire";
          this.recentStopping = true;
          $find(this.snake.body[0]).removeClass("shiny");
        }
        return $('h1').add('title').text(title);
      };

      Game.prototype.toggleGuide = function() {
        this.guide = !this.guide;
        if (this.guide) {
          this.flamePreview();
          this.recentGuiding = true;
          return $find(this.apple).addClass("dull");
        } else {
          return this.updateClass();
        }
      };

      Game.prototype.updateScores = function() {
        if (this.turnCount) {
          this.score += this.getTurnValue();
          $('.total-score .score').text(this.score);
          return $('.turn-count .score').text(this.turnCount);
        }
      };

      Game.prototype.getTurnValue = function() {
        if (!(this.inMotion && !this.recentStopping)) {
          return 1;
        }
        return Math.floor(this.getAppleValue() / 50) + 4;
      };

      Game.prototype.renderWaterTank = function() {
        var percentageHeight, topValue;
        percentageHeight = 1 - (this.waterLevel / this.tankSize);
        topValue = $('#water-tank').height() * percentageHeight;
        return $("#water-level").css({
          'top': topValue + "px"
        });
      };

      Game.prototype.addApple = function() {
        var coord;
        while (true) {
          coord = [Math.floor(Math.random() * this.size), Math.floor(Math.random() * this.size)];
          if (!(((this.apple != null) && this.apple.join() === coord.join()) || this.snake.has(coord) || this.life.has(coord))) {
            break;
          }
        }
        this.apple = coord;
        this.boringTurnStreak = this.appleCount;
        $find(this.apple).addClass("apple");
        if (this.appleCount) {
          this.score += this.getAppleValue();
          this.tankSize += 1;
          this.frameRate *= 0.99;
          $('.apple-count .score').text(this.appleCount);
          this.recentStopping = false;
          this.recentGuiding = this.guide;
          if (this.inMotion) {
            $find(this.snake.body[0]).addClass("shiny");
          }
          if (this.recentGuiding) {
            $find(this.apple).addClass("dull");
          }
          this.startRunLoop();
        }
        return this.appleCount += 1;
      };

      Game.prototype.getAppleValue = function() {
        if (this.recentGuiding) {
          return this.appleCount + 50;
        } else {
          return Math.pow(this.appleCount, 2) + 50;
        }
      };

      Game.prototype.updateClass = function() {
        var cell, cellArr, coord, _i, _len, _ref, _results;
        this.$cells.removeClass("water snake pre-living pre-dying living super-hot");
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
            $(cell).addClass("living");
            if (this.life.has(coord) === "supertrue") {
              _results.push($(cell).addClass("super-hot"));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Game.prototype.flamePreview = function() {
        var cell, cellArr, coord, futureFlames, _i, _len, _ref, _results;
        if (!this.guide) {
          return;
        }
        this.$cells.removeClass("pre-living");
        futureFlames = this.life.detectionSweep();
        _ref = this.$cells;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          cellArr = cell.id.split("-");
          coord = [parseInt(cellArr[1]), parseInt(cellArr[3])];
          if (futureFlames[coord.join()]) {
            _results.push($(cell).addClass("pre-living"));
          } else if (this.life.has(coord)) {
            _results.push($(cell).addClass("pre-dying"));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Game.prototype.gameOver = function() {
        this.inMotion = false;
        $("html").off("mousedown").off("keydown");
        $('html').off("keyup.intro click.intro");
        showGameOverScreen();
        return window.game = null;
      };

      Game.prototype.wash = function(event) {
        var cell, node;
        node = event.target;
        cell = this.getId(node);
        if (!(this.waterLevel && this.life.has(cell))) {
          return;
        }
        this.kill(node, cell);
        this.waterLevel -= 1;
        this.washCount += 1;
        this.score += 10;
        $('.flame-count .score').text(this.washCount);
        $('.total-score .score').text(this.score);
        this.renderWaterTank();
        if (!this.inMotion) {
          return this.flamePreview();
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
