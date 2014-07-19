window.Program = do ->

  start = ->
    return if game?

    resetInfo()
    populateBoard(16)
    window.game = new Game(16)

    bindMouse(game)
    bindKeys(game)
    if window.returningPlayer
      $('#modal').hide()
      $('#new-game').hide()
      $('#modal').find('.message').removeClass('game-over')
    else
      runIntro()

  resetInfo = () ->
    $(".score").text("0")

  populateBoard = (size) ->
    $board = $("#board");
    $board.html("")

    for i in [0...size]
      for j in [0...size]
        $board.append("<li id='row-#{i}-col-#{j}'></li>")

  runIntro = ->
    window.invincible = window.returningPlayer = true
    setTimeout(->
      showInstructions(0)
    , 1)

  showInstructions = (slideNumber) ->
    $modal = $('#modal')
    instructions = [
      "Press W-A-S-D or ↑ ← ↓ → to move",
      "Don't let your #{spanify('head', 'head')} get caught on #{spanify('fire', 'fire')}, or run into your #{spanify('body', 'snake')} (edges are okay, you just wrap around)",
      "Click and drag to douse #{spanify('flames', 'fire')}, but watch your #{spanify('water', 'water')} supply",
      "Have fun, eat #{spanify('apples', 'apple')}, and don't die!"
    ]

    unless instructions[slideNumber]
      window.invincible = false
      $('html').off("keyup.intro click.intro")
      $modal.css('opacity': 0)
      $modal.hide()
      return

    $modal.find('.message').html(instructions[slideNumber])
    $modal.css('opacity': 1)
    setTimeout(->
      $('html').on "keyup.intro click.intro": ->
        $modal.css('opacity': 0)
        setTimeout( ->
          $('html').off("keyup.intro click.intro")
          showInstructions(slideNumber + 1)
        , 1000)
    , 1000)

  spanify = (text, klass) ->
    "<span class='#{klass}'>#{text}</span>"

  showGameOverScreen = ->
    $modal = $("#modal")
    $newGameButton = $('#new-game')
    gameOverMessage = "&#9760; Game Over! &#9760;"
    $modal.css('opacity': 0)
    $modal.show()

    setTimeout(->
      $modal.find('.message').addClass('game-over').html(gameOverMessage)
      $modal.css('opacity': 1)
      $newGameButton.show()
    , 1)

  bindMouse = (game) ->
    $("html").on "mousedown", (event) ->
      do event.preventDefault

      if event.target.tagName is "BUTTON"
        switch $(event.target).attr('id')
          when "up" then do game.snake.north
          when "left" then do game.snake.west
          when "down" then do game.snake.south
          when "right" then do game.snake.east

      game.wash(event) if event.target.tagName is "LI"
      $("li").on "mouseenter", game.wash.bind(game)
      $("html").on "mouseup", -> $("li").off("mouseenter")

  bindKeys = (game) ->
    $('html').on keydown:
      (event) ->
        if event.keyCode in [37, 38, 39, 40, 65, 68, 83, 87]
          do event.preventDefault

        switch event.keyCode
          when 38, 87 then do game.snake.north
          when 37, 65 then do game.snake.west
          when 40, 83 then do game.snake.south
          when 39, 68 then do game.snake.east

  $find = (coord) -> $("#row-#{coord[0]}-col-#{coord[1]}")

  class Snake
    constructor: (@game, length) -> 
      @dir = [0,1]
      @nextDir = [0,1]
      @buildBody(length)

    buildBody: (length) ->
      startY = 12
      startX = 6

      i = -1 
      @body = while (i++ <= length)
        [startY, startX - i]

      $find(@body[0]).addClass("head")
      @torch = @body.pop()
      @game.life.list[@torch.join()] = "supertrue"

    north: ->
      if @dir[0] isnt 1
        @nextDir = [-1, 0]
        do @game.update

    south: -> 
      if @dir[0] isnt -1
        @nextDir = [ 1, 0]
        do @game.update

    east: -> 
      if @dir[1] isnt -1
        @nextDir = [ 0, 1] 
        do @game.update

    west: -> 
      if @dir[1] isnt 1
        @nextDir = [ 0,-1] 
        do @game.update

    has: (coord) -> 
      (return true if coord.join() is part.join()) for part in @body

      return false

    getNext: -> 
      [@game.wrap(@body[0][0] + @nextDir[0]), @game.wrap(@body[0][1] + @nextDir[1])]

    update: ->
      next = do @getNext

      if not window.invincible and (@has(next) or @game.life.has(next))
        do @game.gameOver 
      else if @game.apple? and next.join() is @game.apple.join()
        $find(next).removeClass("apple")
        do @game.addApple 
      else
        @torch = @body.pop()
        
      @game.life.list[@torch.join()] = "supertrue"

      $find(@body[0]).removeClass("head")
      $find(next).addClass("head")

      @dir = @nextDir
      @body.unshift(next)

  class Life
    constructor: (@game) ->
      @list = {}

    patterns: {
      glider: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
      rPentonimo: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
      shortTable: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2]],
      zHexomino: [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 2]],
      stairstepHexomino: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]],
      blockAndGlider: [[0, 0], [0, 1], [1, 0], [1, 2], [2, 2], [2, 3]],
      century: [[0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [2, 1]],
      thunderbird: [[0, 0], [0, 1], [0, 2], [2, 1], [3, 1], [4, 1]],
      herschelParent: [[0, 2], [1, 0], [1, 1], [2, 2], [2, 4], [3, 4]]
    }

    pickPattern: ->
      randomIndex = Math.floor(Math.random() * _.size(@patterns))
      _.values(@patterns)[randomIndex]

    update: ->
      @list = do @detectionSweep
      do @addDeNovoPattern if do @notActiveEnough  

    detectionSweep: ->
      tempList = {}
      for i in [0...@game.size]
        for j in [0...@game.size]
          census = @countLiving([i,j])
          if census is 3 or (census is 2 and @has([i,j]))
            tempList[[i,j].join()] = true

      tempList

    notActiveEnough: ->
      _.size(@list) < 5 + (@game.boringTurnStreak / 5)

    addDeNovoPattern: ->
      loop
        coord = [
          Math.floor(Math.random() * @game.size), 
          Math.floor(Math.random() * @game.size)
        ]

        unless @game.near(coord, @game.snake.body[0], 6)
          break

      cells = for shift in do @pickPattern
        do (shift) ->
          [@game.wrap(shift[0] + coord[0]),
           @game.wrap(shift[1] + coord[1])]

      @list[cell.join()] = "supertrue" for cell in cells
      @game.boringTurnStreak = 0

    countLiving: (cell) -> 
      (nabe for nabe in @neighbors(cell) when @has(nabe)).length

    neighbors: (cell) ->
      units = [
        [-1,-1], [-1, 0], [-1, 1],
        [ 0,-1],          [ 0, 1],
        [ 1,-1], [ 1, 0], [ 1, 1]
      ]

      [@game.wrap(unit[0] + cell[0]), @game.wrap(unit[1] + cell[1])] for unit in units

    has: (coord) -> 
      @list[coord.join()]

  class Game
    constructor: (@size) ->
      @score = @turnCount = @washCount = @appleCount = 0
      @$cells = $('li')
      @waterLevel = @tankSize = 5

      @life = new Life(@)
      @snake = new Snake(@, 5)

      do @addApple
      do @render

    update: ->
      $("li").off("mouseenter")
      @turnCount += 1
      @boringTurnStreak += 1
      if @turnCount % 3 == 0
        @waterLevel = _.min([@waterLevel + 1, @tankSize])

      do @life.update
      do @snake.update
      do @render

    render: ->
      do @updateScores
      do @renderWaterTank
      do @updateClass

    updateScores: ->
      if @turnCount
        @score += 1
        $('.total-score .score').text(@score)
        $('.turn-count .score').text(@turnCount)

    renderWaterTank: -> 
      percentageHeight = 1 - (@waterLevel / @tankSize)
      topValue = $('#water-tank').height() * percentageHeight
      $("#water-level").css('top': topValue + "px")

    addApple: ->
      loop
        coord = [
          Math.floor(Math.random() * @size), 
          Math.floor(Math.random() * @size)
        ]

        unless (@apple? and @apple.join() is coord.join()) or
                @snake.has(coord) or 
                @life.has(coord)
          break

      @apple = coord
      @boringTurnStreak = @appleCount
      $find(@apple).addClass("apple")

      if @appleCount
        @score += (Math.pow(@appleCount, 2) + 50 )
        @tankSize += 1
        $('.apple-count .score').text(@appleCount)

      @appleCount += 1

    updateClass: ->
      @$cells.removeClass("water")
      @$cells.removeClass("snake")
      @$cells.removeClass("living")
      @$cells.removeClass("super-hot")

      for cell in @$cells
        cellArr = cell.id.split("-")
        coord = [parseInt(cellArr[1]), parseInt(cellArr[3])]

        if @snake.has(coord)
          $(cell).addClass("snake")

        if @life.has(coord)
          $(cell).addClass("living")
          if @life.has(coord) is "supertrue"
            $(cell).addClass("super-hot")

    gameOver: ->
      $("html").off("mousedown").off("keydown")
      $('html').off("keyup.intro click.intro")
      do showGameOverScreen
      window.game = null
     
    wash: (event) ->
      return unless @waterLevel
      node = event.target
      cell = @getId(node)

      if @life.has(cell)
        @kill(node, cell)
        @waterLevel -= 1
        @washCount += 1
        @score += 10
        $('.flame-count .score').text(@washCount)
        $('.total-score .score').text(@score)
        do @renderWaterTank
        
    kill: (node, cell) ->
      if @life.has(cell)
        $(node).addClass("water")
        $(node).removeClass("living")
        delete @life.list[cell.join()]

    wrap: (value) ->
      if value < 0 then @size - 1 
      else if value >= @size then 0
      else value

    getId: (target) ->
      [parseInt($(target).attr("id").split("-")[1]),
       parseInt($(target).attr("id").split("-")[3])]

    near: (cellA, cellB, distance) ->
      Math.abs(cellA[0] - cellB[0]) % (@size / 2) < distance ||
      Math.abs(cellA[1] - cellB[1]) % (@size / 2) < distance

  {start: start}