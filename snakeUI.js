$('html').keydown(function (event) {
  switch (event.keyCode){
  case 37:
    game.snake.west();
    break;
  case 38:
    game.snake.north();
    break;
  case 39:
    game.snake.east();
    break;
  case 40:
    game.snake.south();
    break;
  }
  console.log("You pressed keycode: " + event.keyCode);
});

XDIM = 20
YDIM = 20

game = new Snakes.Game(XDIM, YDIM,6, 200)

$(document).ready(function(){
  for (var i = 0; i < YDIM; i++) {
    for (var j = 0; j < XDIM; j++) {
      $("#container").append('<div class="space" id="row-' + i + "col-" + j + '"></div>')
      console.log('<div id="row-' + i + "col-" + j + '"></div>')
    }
  }

  game.start()
})
