window.Program = do ->

  start = ->
    game.gameOver() if game?

    resetInfo()
    populateBoard(16)
    window.game = new Game(16)

    bindMouse(game)
    bindKeys(game)

  resetInfo = (music) ->
    $(".running-score").removeClass("hidden gone")

  populateBoard = (size) ->
    $board = $("#board");
    $board.html("")

    for i in [0...size]
      for j in [0...size]
        $board.append("<li id='row-#{i}-col-#{j}'></li>")

  bindMouse = (game) ->
    $("html").on "mousedown", (event) ->
      game.toggleLiving(event) if event.target.tagName is "LI"
      $("li").on "mouseenter", game.toggleLiving.bind(game)
      $("html").on "mouseup", -> $("li").off("mouseenter")

  bindKeys = (game) ->
    $('html').on keydown:
      (event) ->
        switch event.keyCode
          when 38, 87 then do game.snake.north
          when 37, 65 then do game.snake.west
          when 40, 83 then do game.snake.south
          when 39, 68 then do game.snake.east
          when 32 then do game.toggleTime

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
      @body = while (i++ < length)
        [startY, startX - i]

    north: ->
      if @dir[0] isnt 1
        @nextDir = [-1, 0]
        do @game.timelessUpdate

    south: -> 
      if @dir[0] isnt -1
        @nextDir = [ 1, 0]
        do @game.timelessUpdate

    east: -> 
      if @dir[1] isnt -1
        @nextDir = [ 0, 1] 
        do @game.timelessUpdate

    west: -> 
      if @dir[1] isnt 1
        @nextDir = [ 0,-1] 
        do @game.timelessUpdate

    has: (coord) -> 
      (return true if coord.join() is part.join()) for part in @body

      return false

    getNext: -> 
      [@game.wrap(@body[0][0] + @nextDir[0]), @game.wrap(@body[0][1] + @nextDir[1])]

    update: ->
      next = do @getNext

      if @game.apple? and next.join() is @game.apple.join()
        $find(next).removeClass("apple")
        do @game.addApple 

      if @has(next) or @game.life.has(next)
        do @game.gameOver 
      else
        @game.life.list[@body.pop().join()] = true

      @dir = @nextDir
      @body.unshift(next)

  class Life
    constructor: (@game) ->
      self = @
      @list = {}
      @activeCells = 5

      @rPentomino = [[-2, 0], [-2, 1], [-1, 0], [0, 0], [-1, -1]]

      cells = for shift in @rPentomino 
        do (shift) ->
          [shift[0] + 8,
           shift[1] + 8]

      @list[cell.join()] = true for cell in cells

      @list
   
    update: ->
      @list = do @detectionSweep
      @activeCells = _.size(@list) 

    detectionSweep: ->
      tempList = {}
      for i in [0...@game.size]
        for j in [0...@game.size]
          census = @countLiving([i,j])
          if census is 3 or (census is 2 and @has([i,j]))
            tempList[[i,j].join()] = true

      tempList

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
      @score = @appleCount = @framesPerMinute = 1
      @timeless = true
      @$cells = $('li')

      @snake = new Snake(@, 5)
      @life = new Life(@)

      do @addApple

    toggleTime: ->
      @timeless = not @timeless

      @rampUpRunning unless @timeless

    timelessUpdate: ->
      if @timeless then do @update

    rampUpRunning: ->
      #get game speed back up to "actual" fPM without being jarring

    update: ->
      do @life.update
      do @render
      do @snake.update

      @turnCount += 1

    render: ->
      $(".score").html(" " + @score)
      do @updateClass

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

      @appleCount += 1
      @score += do @getAddedScore
      @apple = coord
      $find(@apple).addClass("apple")

    getAddedScore: -> 
      _.max([0, Math.floor((@appleCount) * _.max(1, Math.pow(@getTimeModifier(), 2)))])


    getTimeModifier: ->
      if @timeless then 0 else @framesPerMinute

    updateClass: ->
      @$cells.removeClass("water")

      for cell in @$cells
        cellArr = cell.id.split("-")
        coord = [parseInt(cellArr[1]), parseInt(cellArr[3])]

        if @snake.has(coord)
          $(cell).addClass("snake")

        if @life.has(coord)
          $(cell).addClass("living")

    gameOver: ->
      $(".running-score").addClass("gone")
      $("html").off("mousedown").off("keydown")

      clearInterval(handler)
      window.game = null
     
    toggleLiving: (event) ->
      node = event.target
      cell = @getId(node)

      if @life.has(cell)
        @kill(node, cell) 
        @timelessUpdate
        
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

  {start: start}