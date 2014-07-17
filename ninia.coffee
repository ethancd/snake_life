window.Program = do ->

  start = ->
    return if game?

    resetInfo()
    populateBoard(16)
    window.game = new Game(16)

    bindMouse(game)
    bindKeys(game)

  resetInfo = () ->
    $(".score").text("0")

  populateBoard = (size) ->
    $board = $("#board");
    $board.html("")

    for i in [0...size]
      for j in [0...size]
        $board.append("<li id='row-#{i}-col-#{j}'></li>")

  bindMouse = (game) ->
    $("html").on "mousedown", (event) ->
      do event.preventDefault
      game.wash(event) if event.target.tagName is "LI"
      $("li").on "mouseenter", game.wash.bind(game)
      $("html").on "mouseup", -> $("li").off("mouseenter")

  bindKeys = (game) ->
    $('html').on keydown:
      (event) ->
        if event.keyCode in [32, 37, 38, 39, 40, 65, 68, 80, 83, 87]
          do event.preventDefault

        switch event.keyCode
          when 38, 87 then do game.snake.north
          when 37, 65 then do game.snake.west
          when 40, 83 then do game.snake.south
          when 39, 68 then do game.snake.east
          when 32, 80 then do game.togglePause

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
      @game.life.list[@body.pop().join()] = true

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

      if @has(next) or @game.life.has(next)
        do @game.gameOver 
      else if @game.apple? and next.join() is @game.apple.join()
        $find(next).removeClass("apple")
        do @game.addApple 
      else
        @game.life.list[@body.pop().join()] = true

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
          [shift[0] + coord[0],
           shift[1] + coord[1]]

      @list[cell.join()] = true for cell in cells
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
      @tankSize = 5
      @waterLevel = 5

      @life = new Life(@)
      @snake = new Snake(@, 5)

      do @addApple
      do @render

    togglePause: ->
      if @paused
        $("html").off("keydown")
        bindKeys(@)
        bindMouse(@)
        do $('#pause-modal').hide
      else
        do $('#pause-modal').show
        $("html").off("mousedown").off("keydown")
        $('html').on keydown:
          (event) ->
            do event.preventDefault
            do game.togglePause if event.keyCode == 32 || event.keyCode == 80

      @paused = !@paused

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

      for cell in @$cells
        cellArr = cell.id.split("-")
        coord = [parseInt(cellArr[1]), parseInt(cellArr[3])]

        if @snake.has(coord)
          $(cell).addClass("snake")

        if @life.has(coord)
          $(cell).addClass("living")

    gameOver: ->
      $("html").off("mousedown").off("keydown")

      if window.handler?
        clearInterval(handler)

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