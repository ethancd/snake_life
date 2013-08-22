var Program = (function(){

  var Snake = function(length, game){
    this.dir = [0,1];
    this.nextDir = [0,1];
    this.buildBody(length, game);
  };

  Snake.prototype.buildBody = function(length, game){
    this.body = []
    var startY = Math.floor(0.75 * game.yDim)
    var startX = Math.floor(0.5  * game.xDim);

    this.body.push([startY, startX]) 
    for (var i = 1; i < length; i++) {
      this.body.push([startY, startX-i]);
    }
  }

  Snake.prototype.north = function(){
    if (this.dir[0] != 1) {
      this.nextDir = [-1,0];
    }
  };

  Snake.prototype.south = function(){
    if (this.dir[0] != -1) {
      this.nextDir = [1,0];
    }
  };

  Snake.prototype.east = function(){
    if (this.dir[1] != -1) {
      this.nextDir = [0,1];
    }
  };

  Snake.prototype.west = function(){
    if (this.dir[1] != 1) {
      this.nextDir = [0,-1];
    }
  };

  Snake.prototype.has = function(coord){
    var full = false;
    _.each(this.body, function(elem){
      if (elem[0] == coord[0] && elem[1] == coord[1]) {
        full = true;
      }
    })
    return full;
  };

  Snake.prototype.findNext = function(){
    return [this.body[0][0]+this.nextDir[0], this.body[0][1]+this.nextDir[1]];
  };

  Snake.prototype.update = function(game){
    var next = this.findNext();

    if (game.apple && (next[0] == game.apple[0] && next[1] == game.apple[1])) {
      game.addApple();
    } else if (game.offscreen(next) || this.has(next) || game.life.has(next)){
      game.gameOver();
    } else {
      game.life.list.push(this.body.pop());
    }

    this.dir = this.nextDir;
    this.body.unshift(next);
  };

  var Life = function(game) {
    var that = this;
    this.corners = []
    _.each([0, 1, game.yDim-1, game.yDim-2], function(y){
      _.each([0, 1, game.xDim-1, game.xDim-2], function(x){
        that.corners.push([y,x]);
      })
    })

    var rPentomino = [
      [Math.floor(game.yDim/2)-2, Math.floor(game.xDim/2)  ], 
      [Math.floor(game.yDim/2)-2, Math.floor(game.xDim/2)+1], 
      [Math.floor(game.yDim/2)-1, Math.floor(game.xDim/2)  ], 
      [Math.floor(game.yDim/2)  , Math.floor(game.xDim/2)  ], 
      [Math.floor(game.yDim/2)-1, Math.floor(game.xDim/2)-1]
    ]

    this.list = _.union(rPentomino, this.corners);
  };

  Life.prototype.update = function(game) {
    this.list = this.detectionSweep(game);
  };

  Life.prototype.detectionSweep = function(game) {
    var tempList = []
    for (var i = 0; i < game.yDim; i++) {
      for (var j = 0; j < game.xDim; j++) {
        var census = this.countLiving([i,j])

        if (this.has([i,j]) && (census == 2 || census == 3)) {
          tempList.push([i,j]);
        } else if (census == 3) {
          tempList.push([i,j]);
        }
      }
    }

    return _.union(tempList, this.corners)
  };

  Life.prototype.countLiving = function(cell) {
    var that = this;
    var result = 0;
    _.each(this.neighbors(cell), function(elem){
      if (that.has(elem)) {
        result += 1;
      }
    })
    return result;
  };

  Life.prototype.neighbors = function(cell) {
    var units = [
      [-1,-1], 
      [-1, 0], 
      [-1, 1],
      [ 0,-1], 
      [ 0, 1],
      [ 1,-1], 
      [ 1, 0], 
      [ 1, 1]
    ];

    return _.map(units, function(unit){
      return [unit[0] + cell[0], unit[1] + cell[1]];
    })
  };

  Life.prototype.has = function(coord){
    var full = false;
    _.each(this.list, function(elem){
      if (elem[0] == coord[0] && elem[1] == coord[1]) {
        full = true;
      }
    })
    return full;
  };

  Life.prototype.findObj = function(coord){
    var idx = null;
    _.each(this.list, function(elem, i){
      if (elem[0] == coord[0] && elem[1] == coord[1]) {
        idx = i;
      }
    })
    return idx;
  };

  var Game = function(size, timeStep){
    this.xDim = size;
    this.yDim = size;
    this.timeStep = timeStep;

    this.scoreMod = Math.pow((Math.pow((20/size), 2) * (250 / this.timeStep)), 1.5);
    this.score = 0;
    this.potentialScore = 0;
    this.appleCount = 0;
    this.turnCount = 0;
    this.delay = Math.floor(size/3);

    this.snake = new Snake(Math.floor(size/3), this);
    this.life = new Life(this);
    this.addApple();
  };

  Game.prototype.update = function() {
    if (this.turnCount > this.delay) {
      this.life.update(this);
      this.render();
    }

    this.snake.update(this);
    this.turnCount += 1;
    this.score += (Math.ceil(Math.log(this.turnCount * this.life.list.length)));
  };

  Game.prototype.render = function(){
    this.potentialScore = this.calculatePotentialScore()
    $(".score").html(" " + this.score);
    $(".potential").html(" + " + this.potentialScore);
    for (var i = 0; i < this.yDim; i++) {
      for (var j = 0; j < this.xDim; j++) {
        this.updateClass(i, j);
      }
    }
  };

  Game.prototype.addApple = function() {
    var randY = Math.floor(Math.random()*this.yDim);
    var randX = Math.floor(Math.random()*this.xDim);
    
    while((this.apple && (this.apple[0] == randY && this.apple[1] == randX))||
           this.snake.has([randY,randX]) || 
           this.life.has([randY, randX])){
      randY = Math.floor(Math.random()*this.yDim);
      randX = Math.floor(Math.random()*this.xDim);
    }

    this.appleCount += 1;
    this.score += this.potentialScore;
    this.apple = [randY, randX];
  };

  Game.prototype.calculatePotentialScore = function(){
    return Math.floor(
      (10 + this.appleCount) * (this.life.list.length - 16) * this.scoreMod
    );
  };

  Game.prototype.updateClass = function(i, j){
    var $cell = $("#row-"+i+"-col-"+j);

    $cell.removeClass("water");

    if (this.snake.has([i,j])){
      $cell.addClass("snake");
    } else {
      $cell.removeClass("snake");
    }

    if (this.apple && (this.apple[0] == i && this.apple[1] == j)) {
      $cell.addClass("apple");
    } else {
      $cell.removeClass("apple");
    }

    if (this.life.has([i,j])){
      $cell.addClass("living");
    } else {
      $cell.removeClass("living");
    }
  };

  Game.prototype.offscreen = function(coord) {
    return (
      coord[0] < 0          || 
      coord[0] >= this.yDim || 
      coord[1] < 0          || 
      coord[1] >= this.xDim
    )
  };

  Game.prototype.gameOver = function() {
    $("h2").toggleClass("gone");
    $(".info").removeClass("hidden");
    clearInterval(handler);
  };

  Game.prototype.toggleLiving = function(event){
    var cell = this.getId(event.target);
    if (this.life.has(cell)){
      $(event.target).addClass("water");
      $(event.target).removeClass("living");
      this.life.list.splice(this.life.findObj(cell), 1);
    } else {
      $(event.target).addClass("living");
      this.life.list.push(cell);
    }
  };

  Game.prototype.getId = function(target){
    var idY = parseInt($(target).attr("id").split("-")[1]);
    var idX = parseInt($(target).attr("id").split("-")[3]);
    return [idY, idX];
  }

  var start = function(size, timeStep){
    game = new Game(size, timeStep);

    populateBoard(game);
    bindMouse(game);
    bindKeys();

    handler = setInterval(function(){
      game.update();
      game.render();
      }, timeStep);
  };

  var populateBoard = function(game){
    $("ul").html("").css({
      "width": game.xDim*30 +"px", 
      "height": game.yDim*30 + "px",
      "margin": "0px " + (700 - game.xDim*30)/2 + "px"
    });
    for (var i = 0; i < game.yDim; i++) {
      for (var j = 0; j < game.xDim; j++) {
        $("ul").append('<li id="row-' + i + "-col-" + j + '"></li>');
      }
    }
  };

  var bindMouse = function(game){
    $("html").on("mousedown", function(event){
      if (event.target.tagName == "LI"){
        game.toggleLiving(event);
      }
      $("li").on("mouseenter", game.toggleLiving.bind(game));
      $("html").on("mouseup", function(){
        $("li").off("mouseenter");
      })
    })
  };

  var bindKeys = function(){
    $('html').on("keydown", function(event) {
      switch (event.keyCode){
      case 38:
      case 87:
        game.snake.north();
        break;
      case 37:
      case 65:
        game.snake.west();
        break;
      case 40:
      case 83:
        game.snake.south();
        break;
      case 39:
      case 68:
        game.snake.east();
        break;
      }
    });
  };

  return {start: start};

})();