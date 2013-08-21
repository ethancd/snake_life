var Snakes = (function(){

  turnCount = 0;
  scoreCount = 0;
  appleCount = -1;
  potentialScore = 0;
  topLeft = [];
  bottomLeft = [];
  topRight = [];
  bottomRight = [];

  var Snake = function(length, body){
    this.dir = [0,1]
    this.body = body
  }

  Snake.prototype.north = function(){
    if (this.dir[0] != 1) {
      this.dir = [-1,0]
    }
  }

  Snake.prototype.south = function(){
    if (this.dir[0] != -1) {
      this.dir = [1,0]
    }
  }

  Snake.prototype.east = function(){
    if (this.dir[1] != -1) {
      this.dir = [0,1]
    }
  }

  Snake.prototype.west = function(){
    if (this.dir[1] != 1) {
      this.dir = [0,-1]
    }
  }

  Snake.prototype.has = function(coord){
    var full = false
    _.each(this.body, function(elem){
      if (elem[0] == coord[0] && elem[1] == coord[1]) {
        full = true
      }
    })
    return full
  }

  var Game = function(xDim, yDim, length, time){
    this.xDim = xDim;
    this.yDim = yDim;
    this.time = time;
    this.delay = length + 1;
    this.apple = [yDim * 2, xDim * 2]

    var body = []
    var startY = Math.floor(3 * yDim/4), startX = Math.floor(xDim/2)

    body.push([startY, startX]) 
    for (var i = 1; i < length; i++) {
      body.push([startY, startX-i])
    }

    this.snake = new Snake(length, body)
    this.life = new Life(this)
  }

  Game.prototype.addApple = function() {
    var randY = Math.floor(Math.random()*this.yDim),
        randX = Math.floor(Math.random()*this.xDim)
    
    while(this.snake.has([randY,randX]) || this.life.has([randY, randX])){
      randY = Math.floor(Math.random()*this.yDim)
      randX = Math.floor(Math.random()*this.xDim)
    }

    appleCount += 1;
    scoreCount += potentialScore;
    this.apple = [randY, randX];
  }

  Game.prototype.update = function() {
    if (turnCount == this.delay - 1) {
      this.addApple();
    } else if (turnCount > this.delay) {
      this.life.update(this);
      this.render();
    } 

    this.snake.update(this);
    turnCount += 1;
  }

  Game.prototype.offscreen = function(coord) {
    return(
      coord[0] < 0          || 
      coord[0] >= this.yDim || 
      coord[1] < 0          || 
      coord[1] >= this.xDim
      )
  }

  Game.prototype.gameOver = function() {
    $("h2").html("Final Score = <strong>" + scoreCount + "</strong>");
    clearInterval(handler)
  }

  // Game.prototype.draw = function () {
  // var grid = Array(this.yDim);

  //   for (var i = 0; i < this.yDim; i++){
  //     grid[i] = Array(this.xDim)
  //     for (var j = 0; j < this.xDim; j++){
  //       if (this.snake.has([i,j])){
  //         grid[i][j] = "s";
  //       } else if (this.apple[0] == i && this.apple[1] == j) {
  //         grid[i][j] = "a";
  //       }
  //     }
  //   }
  //   _.each(grid, function(elem, i){
  //     grid[i] = elem.join(' ');
  //   })
  //   grid = grid.join("\n")
  //   $("pre").html(grid);
  // };

Game.prototype.render = function(){
  $(".score").html(" " + scoreCount);
  $(".potential").html(" + " + potentialScore)
  for (var i = 0; i < this.yDim; i++) {
    for (var j = 0; j < this.xDim; j++) {
      if (this.snake.has([i,j])){
        $("#row-"+i+"-col-"+j).addClass("snake");
      } else {
        $("#row-"+i+"-col-"+j).removeClass("snake");
      }
      if (this.apple[0] == i && this.apple[1] == j) {
        $("#row-"+i+"-col-"+j).addClass("apple");
      } else {
        $("#row-"+i+"-col-"+j).removeClass("apple");
      }
      if (this.life.has([i,j])){
        $("#row-"+i+"-col-"+j).addClass("living");
      } else {
       $("#row-"+i+"-col-"+j).removeClass("living")
      }
    }
  }
  
}

  Snake.prototype.update = function(game){
    var next = [this.body[0][0]+this.dir[0], this.body[0][1] + this.dir[1]]


    if (next[0] == game.apple[0] && next[1] == game.apple[1]) {
      game.addApple();
    } else {
      game.life.list.push(this.body.pop());
    }

    if (game.offscreen(next) || this.has(next) || game.life.has(next)){
      game.gameOver();
    }

    this.body.unshift(next);
  }

  Game.prototype.start = function(){
    var that = this;

    handler = setInterval(function(){
      that.update();
      that.render();
    }, this.time)
  };

  var Life = function(game) {

    topLeft = [[0,0],[0,1],[1,1],[1,0]];
    bottomLeft = [
      [game.yDim-1, 0], 
      [game.yDim-2, 1], 
      [game.yDim-2, 0], 
      [game.yDim-1, 1]
    ];
    topRight = [
      [0,game.xDim-2],
      [0,game.xDim-1],
      [1,game.xDim-1],
      [1,game.xDim-2]
    ];
    bottomRight = [
      [game.yDim-2, game.xDim-2], 
      [game.yDim-1, game.xDim-1], 
      [game.yDim-1, game.xDim-2], 
      [game.yDim-2, game.xDim-1]
    ];
    var rPentomino = [
      [Math.floor(game.yDim/2)-2, Math.floor(game.xDim/2)], 
      [Math.floor(game.yDim/2)-2, Math.floor(game.xDim/2)+1], 
      [Math.floor(game.yDim/2)-1, Math.floor(game.xDim/2)], 
      [Math.floor(game.yDim/2), Math.floor(game.xDim/2)], 
      [Math.floor(game.yDim/2)-1, Math.floor(game.xDim/2)-1]
    ]

    this.list = rPentomino.concat(topLeft, topRight, bottomLeft, bottomRight)
  };

  Life.prototype.update = function(game) {
    this.list = this.detectionSweep(game)
    potentialScore = (10 + appleCount) * ($(".living").length - 16)
  };

  Life.prototype.mutate = function(game) {
    var randY = Math.floor(Math.random()*game.yDim),
        randX = Math.floor(Math.random()*game.xDim)
    
    while(game.snake.has([randY,randX])){
      randY = Math.floor(Math.random()*game.yDim)
      randX = Math.floor(Math.random()*game.xDim)
    }

    this.list.push([randY, randX])
  };


  Life.prototype.detectionSweep = function(game) {
    var tempList = []
    for (var i = 0; i < game.yDim; i++) {
      for (var j = 0; j < game.xDim; j++) {
        if (this.has([i,j])) {
          if (_.include([2,3],this.countLiving(game, [i,j]))){
            tempList.push([i,j])
          }
        } else {
          if (3 == this.countLiving(game, [i,j])){
            tempList.push([i,j])
          }
        }
      }
    }

    return tempList.concat(topLeft, topRight, bottomLeft, bottomRight)
  };

  Life.prototype.countLiving = function(game, cell) {
    var that = this
    var result = 0
    _.each(this.neighbors(cell), function(elem){
      if (that.has(elem)) {
        result += 1
      }
    })
    return result
  };

  Life.prototype.neighbors = function(cell) {
    var adjs = [
    [-1,-1], [-1, 0], [-1, 1],
    [ 0,-1], [ 0, 1],
    [ 1,-1], [ 1, 0], [1, 1]
    ]
    var result = _.map(adjs, function(adj){
      return [adj[0] + cell[0], adj[1] + cell[1]]
    })
    return(result)
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

  return {
    Game: Game,
    Snake: Snake,
    Life: Life
  }
})();

$('html').on("keydown", function (event) {
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
  console.log("You pressed keycode: " + event.keyCode);
});

XDIM = 20
YDIM = 20

game = new Snakes.Game(XDIM, YDIM, 6, 180)

$(document).ready(function(){
  $("ul").css({"width": XDIM*30 +"px", "height": YDIM*30 + "px"} )
  for (var i = 0; i < YDIM; i++) {
    for (var j = 0; j < XDIM; j++) {
      $("ul").append('<li id="row-' + i + "-col-" + j + '"></li>')
      console.log('<li id="row-' + i + "-col-" + j + '"></li>')
    }
  }

  $("li").on("click", function(){
    $(this).toggleClass("living");
    var idY = parseInt($(this).attr("id").split("-")[1]);
    var idX = parseInt($(this).attr("id").split("-")[3]);
    console.log([idY, idX])
    if (game.life.has([idY, idX])){
      game.life.list.splice(game.life.list.indexOf([idY, idX]), 1);
    } else {
      game.life.list.push([idY, idX]);
    }
  })

  game.start()
})
