// Generated by CoffeeScript 1.6.3
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.Program = (function() {
    var $find, Game, Life, Snake, bindKeys, bindMouse, highScoreRef, modifyStyle, playSong, populateBoard, populateScoreTable, resetInfo, setLayout, setQuality, start;
    highScoreRef = new Firebase("https://snake-life.firebaseio.com//scoreList");
    start = function(size, timeStep, quality, music) {
      if (typeof game !== "undefined" && game !== null) {
        game.gameOver();
      }
      resetInfo(music);
      populateBoard(size);
      modifyStyle(size, timeStep, quality);
      if (music) {
        playSong(timeStep);
      }
      window.game = new Game(timeStep, size, music);
      bindMouse(game);
      bindKeys(game);
      return window.handler = setInterval(function() {
        game.update();
        if (typeof game !== "undefined" && game !== null) {
          return game.render();
        }
      }, timeStep);
    };
    playSong = function(timeStep) {
      var song;
      $("div.audio").removeClass("hidden");
      song = $(".song")[0];
      song.play();
      return song.currentTime = 0;
    };
    resetInfo = function(music) {
      $(".info").addClass("hidden");
      $(".personal-high").removeClass("hidden");
      $(".final-score").addClass("gone");
      $(".running-score").removeClass("hidden gone");
      if (!music) {
        return $("div.audio").addClass("hidden");
      }
    };
    populateBoard = function(size) {
      var i, j, _i, _results;
      $("ul").html("");
      _results = [];
      for (i = _i = 0; 0 <= size ? _i < size : _i > size; i = 0 <= size ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (j = _j = 0; 0 <= size ? _j < size : _j > size; j = 0 <= size ? ++_j : --_j) {
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
    setLayout = function(size, timeStep) {
      return {
        '@snake-fade': timeStep * Math.floor(size / 2) + "ms",
        '@life-fade': timeStep * 30 + "ms",
        '@game-size': size * 30 + "px",
        '@game-margin': _.max([20, (640 - size * 30) / 2]) + "px",
        '@wrap-width': size <= 20 ? "1000px" : size * 30 + 400 + "px"
      };
    };
    modifyStyle = function(size, timeStep, quality) {
      return window.less.modifyVars($.extend(setLayout(size, timeStep), setQuality(quality)));
    };
    bindMouse = function(game) {
      return $("html").on("mousedown", function(event) {
        if (event.target.tagName === "LI") {
          game.toggleLiving(event);
        }
        $("li").on("mouseenter", game.toggleLiving.bind(game));
        return $("html").on("mouseup", function() {
          return $("li").off("mouseenter");
        });
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
          }
        }
      });
    };
    $find = function(coord) {
      return $("#row-" + coord[0] + "-col-" + coord[1]);
    };
    populateScoreTable = function() {
      var $table, scoreView;
      $table = $("table.high-scores-table");
      $table.html("<tr><th>Rank<th>Name<th>Score<th>Time");
      scoreView = highScoreRef.startAt();
      return scoreView.once("value", function(allScoresSnapshot) {
        var i, names;
        i = 1;
        names = [];
        return allScoresSnapshot.forEach(function(scoreSnapshot) {
          var key, name, score, size, speed, time, val, _ref;
          if (i <= 10) {
            _ref = (function() {
              var _ref, _results;
              _ref = scoreSnapshot.val();
              _results = [];
              for (key in _ref) {
                val = _ref[key];
                _results.push(val);
              }
              return _results;
            })(), name = _ref[0], score = _ref[1], size = _ref[2], speed = _ref[3], time = _ref[4];
            if (__indexOf.call(names, name) < 0) {
              names.push(name);
              $table.append("<tr><td>" + i + ".<td>" + name + "<td>" + score + "<td>" + time);
              i += 1;
            }
          }
          return false;
        });
      });
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
        startY = Math.floor(0.75 * this.game.yDim);
        startX = Math.floor(0.5 * this.game.xDim);
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
          return this.nextDir = [-1, 0];
        }
      };

      Snake.prototype.south = function() {
        if (this.dir[0] !== -1) {
          return this.nextDir = [1, 0];
        }
      };

      Snake.prototype.east = function() {
        if (this.dir[1] !== -1) {
          return this.nextDir = [0, 1];
        }
      };

      Snake.prototype.west = function() {
        if (this.dir[1] !== 1) {
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
        if ((this.game.apple != null) && next.join() === this.game.apple.join()) {
          $find(next).removeClass("apple");
          this.game.addApple();
        } else if (this.game.offscreen(next) || this.has(next) || this.game.life.has(next)) {
          this.game.gameOver();
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
        var cell, cells, offset, x, xArray, y, yArray, _i, _len, _ref, _ref1, _results;
        offset = _.max([Math.floor(this.game.xDim / 4) - 3, 0]);
        this.corners = {};
        _ref = [this.game.yDim - 1, this.game.xDim - 1], y = _ref[0], x = _ref[1];
        yArray = [offset, offset + 1, y - offset, y - offset - 1];
        xArray = [offset, offset + 1, x - offset, x - offset - 1];
        cells = (_ref1 = []).concat.apply(_ref1, (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = xArray.length; _i < _len; _i++) {
            x = xArray[_i];
            _results.push((function(x) {
              var _j, _len1, _results1;
              _results1 = [];
              for (_j = 0, _len1 = yArray.length; _j < _len1; _j++) {
                y = yArray[_j];
                _results1.push([y, x]);
              }
              return _results1;
            })(x));
          }
          return _results;
        })());
        _results = [];
        for (_i = 0, _len = cells.length; _i < _len; _i++) {
          cell = cells[_i];
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
      function Game(timeStep, size, music) {
        var length;
        this.timeStep = timeStep;
        this.music = music;
        this.startTime = new Date();
        this.xDim = this.yDim = size;
        this.score = this.potentialScore = this.appleCount = this.turnCount = 0;
        this.scoreMod = Math.pow(Math.pow(20 / size, 2.0) * (350 / this.timeStep), 1.1);
        this.delay = length = Math.floor(size / 3);
        this.snake = new Snake(this, length);
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
        var high;
        this.potentialScore = this.calculatePotentialScore();
        $(".score").html(" " + this.score);
        $(".potential").html(" + " + this.potentialScore);
        high = parseInt($(".high-score").html());
        if (this.score > high) {
          $(".high-score").html(" " + this.score);
        }
        return this.updateClass();
      };

      Game.prototype.addApple = function() {
        var coord;
        while (true) {
          coord = [Math.floor(Math.random() * this.yDim), Math.floor(Math.random() * this.xDim)];
          if (!(((this.apple != null) && this.apple.join() === coord.join()) || this.snake.has(coord) || this.life.has(coord))) {
            break;
          }
        }
        this.appleCount += 1;
        this.score += this.potentialScore;
        this.apple = coord;
        return $find(this.apple).addClass("apple");
      };

      Game.prototype.calculatePotentialScore = function() {
        return _.max([0, Math.floor((10 + this.appleCount) * (this.life.activeCells - 1) * this.scoreMod)]);
      };

      Game.prototype.updateClass = function() {
        var $cells, cell, cellArr, coord, _i, _len, _results;
        $cells = $("li");
        $cells.removeClass("water");
        _results = [];
        for (_i = 0, _len = $cells.length; _i < _len; _i++) {
          cell = $cells[_i];
          cellArr = cell.id.split("-");
          coord = [parseInt(cellArr[1]), parseInt(cellArr[3])];
          if (this.snake.has(coord)) {
            if (cell.className.indexOf("presnake") === -1) {
              cell.className += " presnake";
              (function(cell) {
                return setTimeout((function() {
                  return cell.className += " snake";
                }), 1);
              })(cell);
            }
          } else {
            cell.className = cell.className.replace(/(?:^|\s)presnake(?!\S)/, '');
            cell.className = cell.className.replace(/(?:^|\s)snake(?!\S)/, '');
          }
          if (this.life.has(coord)) {
            if (cell.className.indexOf("prelife") === -1) {
              cell.className += " prelife";
              _results.push((function(cell) {
                return setTimeout((function() {
                  return cell.className += " living";
                }), 1);
              })(cell));
            } else {
              _results.push(void 0);
            }
          } else {
            cell.className = cell.className.replace(/(?:^|\s)prelife(?!\S)/, '');
            _results.push(cell.className = cell.className.replace(/(?:^|\s)living(?!\S)/, ''));
          }
        }
        return _results;
      };

      Game.prototype.offscreen = function(coord) {
        return coord[0] < 0 || coord[0] >= this.yDim || coord[1] < 0 || coord[1] >= this.xDim;
      };

      Game.prototype.gameOver = function() {
        var minutes, rawTime, seconds, sfx, song, _ref;
        this.endTime = new Date();
        rawTime = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
        minutes = Math.floor(rawTime / 60) + ":";
        seconds = rawTime % 60 < 10 ? "0" + rawTime % 60 : rawTime % 60;
        this.time = minutes + seconds;
        $(".running-score").addClass("gone");
        $(".final-score").removeClass("gone");
        $(".info").removeClass("hidden");
        $("button.show-scores").removeClass("hidden");
        $("html").off("mousedown").off("keydown");
        if (game.music) {
          _ref = $("audio").get(), song = _ref[0], sfx = _ref[1];
          song.pause();
          sfx.play();
          sfx.volume = song.volume;
        }
        clearInterval(handler);
        if (window.snakeUserName != null) {
          this.postHighScore();
          return window.game = null;
        } else {
          return setTimeout((function() {
            $("form.user-name").removeClass("gone");
            $("form.user-name input[type=text]").focus();
            return $(".shade").removeClass("gone");
          }), 500);
        }
      };

      Game.prototype.postHighScore = function() {
        var id, userScoreRef;
        id = this.endTime + " " + Math.random().toString(36).slice(2, 6);
        userScoreRef = highScoreRef.child(id);
        userScoreRef.setWithPriority({
          name: window.snakeUserName,
          score: this.score,
          time: this.time,
          size: this.xDim,
          speed: this.timeStep
        }, Math.abs(1 / (1 + this.score)));
        return populateScoreTable();
      };

      Game.prototype.toggleLiving = function(event) {
        var cell, cells, i, new_cell, node, nodes, _i, _ref;
        node = event.target;
        cell = this.getId(node);
        if (this.life.has(cell)) {
          this.kill(node, cell);
          if (event.shiftKey) {
            cells = this.getBonusCells(cell);
            nodes = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = cells.length; _i < _len; _i++) {
                new_cell = cells[_i];
                _results.push($find(new_cell));
              }
              return _results;
            })();
            for (i = _i = 0, _ref = nodes.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              this.kill(nodes[i], cells[i]);
            }
            console.log(this.scoreMod);
            return this.score -= Math.floor(nodes.length * (10 + this.appleCount) * this.scoreMod);
          }
        } else {
          return this.vive(node, cell, event);
        }
      };

      Game.prototype.kill = function(node, cell) {
        if (this.life.has(cell)) {
          $(node).addClass("water");
          $(node).removeClass("prelife living");
          return delete this.life.list[cell.join()];
        }
      };

      Game.prototype.vive = function(node, cell, event) {
        if (!this.life.has(cell)) {
          $(node).addClass("prelife");
          setTimeout((function() {
            return $(node).addClass("living");
          }), 1, event);
          return this.life.list[cell.join()] = true;
        }
      };

      Game.prototype.getBonusCells = function(cell) {
        var bonusCells, c, cells, coords, dir, dirs, i, nabe, _i, _len, _ref;
        bonusCells = [];
        cells = [cell];
        i = 10;
        while (cells.length > 0 && i > 0) {
          i -= 1;
          cell = cells.shift();
          dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
          for (_i = 0, _len = dirs.length; _i < _len; _i++) {
            dir = dirs[_i];
            nabe = [dir[0] + cell[0], dir[1] + cell[1]];
            coords = (function() {
              var _j, _len1, _results;
              _results = [];
              for (_j = 0, _len1 = bonusCells.length; _j < _len1; _j++) {
                c = bonusCells[_j];
                _results.push(c.join(","));
              }
              return _results;
            })();
            if ((_ref = nabe.join(","), __indexOf.call(coords, _ref) < 0) && this.life.has(nabe)) {
              cells.push(nabe);
              bonusCells.push(nabe);
            }
          }
        }
        return bonusCells;
      };

      Game.prototype.getId = function(target) {
        return [parseInt($(target).attr("id").split("-")[1]), parseInt($(target).attr("id").split("-")[3])];
      };

      return Game;

    })();
    return {
      start: start
    };
  })();

}).call(this);
