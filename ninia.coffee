window.Program = do ->

  start = (size, timeStep, quality, music) ->
    game.gameOver() if game?

    resetInfo(music)
    populateBoard(size)
    modifyStyle(size, timeStep, quality)
    playSong(timeStep) if (music) 

    window.game = new Game(timeStep, size, music)

    bindMouse(game)
    bindKeys(game)

    window.handler = setInterval ->
        game.update()
        game.render() if game?
      , timeStep

  playSong = (timeStep) ->
    $('div.audio').removeClass("hidden") 
    song = $(".song")[0]
    #song.webkitPreservesPitch = false #not functioning
    song.play()
    #song.playbackRate = 300 / timeStep #not sure if good idea
    song.currentTime = 0

  resetInfo = (music) ->
    $(".info").addClass("hidden")
    $(".final-score").addClass("gone")
    $(".running-score").removeClass("hidden gone")
    $("div.audio").addClass("hidden") unless music

  populateBoard = (size) ->
    $("ul").html("")
    for i in [0...size]
      for j in [0...size]
        $("ul").append("<li id='row-#{i}-col-#{j}'></li>")

  setQuality = (quality) -> 
    switch quality
      when "fancy" then {"@faded": "0.5"}
      when "less_fancy" then {"@faded": "1"}
      when "plain"
        $("li").addClass("no-box-shadow")
        {"@faded": "1"}

  setLayout = (size, timeStep) ->
    {
      '@snake-fade': timeStep * Math.floor(size/2) + "ms",
      '@life-fade': timeStep * 30 + "ms",
      '@game-size': size * 30 + "px",
      '@game-margin': _.max([20, (640 - size*30)/2]) + "px",
      '@wrap-width': if size <= 20 then "1000px" else size * 30 + 400 + "px"
    }

  modifyStyle = (size, timeStep, quality) ->
    window.less.modifyVars($.extend(setLayout(size, timeStep), setQuality(quality)))

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

  $find = (coord) -> $("#row-#{coord[0]}-col-#{coord[1]}")

  class Snake
    constructor: (@game, length) -> 
      @dir = [0,1]
      @nextDir = [0,1]
      @buildBody(length)

    buildBody: (length) ->
      startY = Math.floor(0.75 * @game.yDim)
      startX = Math.floor(0.5  * @game.xDim)

      i = -1 
      @body = while (i++ < length)
        [startY, startX - i]

    north: -> @nextDir = [-1, 0] if @dir[0] isnt  1
    south: -> @nextDir = [ 1, 0] if @dir[0] isnt -1
    east:  -> @nextDir = [ 0, 1] if @dir[1] isnt -1
    west:  -> @nextDir = [ 0,-1] if @dir[1] isnt  1

    has: (coord) -> 
      (return true if coord.join() is part.join()) for part in @body
      return false

    findNext: -> [@body[0][0] + @nextDir[0], @body[0][1] + @nextDir[1]]

    update: ->
      next = do @findNext
      if @game.apple? and next.join() is @game.apple.join()
        $find(next).removeClass("apple")
        do @game.addApple 
      else if @game.offscreen(next) or @has(next) or @game.life.has(next)
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

      rPentomino = [[-2, 0], [-2, 1], [-1, 0], [0, 0], [-1, -1]]

      cells = for shift in rPentomino 
        do (shift) ->
          [shift[0] + Math.floor(self.game.yDim/2),
           shift[1] + Math.floor(self.game.xDim/2)]

      @list[cell.join()] = true for cell in cells
      do @generateCorners

      $.extend(@list, @corners)

    generateCorners: ->
      offset = _.max([Math.floor(@game.xDim/4) - 3, 0])
      @corners = {}
      [y, x] = [@game.yDim - 1, @game.xDim - 1]

      yArray = [offset, offset + 1, y - offset, y - offset - 1]
      xArray = [offset, offset + 1, x - offset, x - offset - 1]

      cells = [].concat((for x in xArray 
        do (x) ->
          [y, x] for y in yArray)...)

      @corners[cell.join()] = true for cell in cells
      
    update: ->
      @list = do @detectionSweep
      @activeCells = (_.size(@list) - _.size(@corners))

    detectionSweep: ->
      tempList = {}
      for i in [0...@game.yDim]
        for j in [0...@game.xDim]
          census = @countLiving([i,j])
          if census is 3 or (census is 2 and @has([i,j]))
            tempList[[i,j].join()] = true

      $.extend(tempList, @corners)

    countLiving: (cell) -> 
      (nabe for nabe in @neighbors(cell) when @has(nabe)).length

    neighbors: (cell) ->
      units = [
        [-1,-1], [-1, 0], [-1, 1],
        [ 0,-1],          [ 0, 1],
        [ 1,-1], [ 1, 0], [ 1, 1]
      ]

      [unit[0] + cell[0], unit[1] + cell[1]] for unit in units

    has: (coord) -> @list[coord.join()]

  class Game
    constructor: (@timeStep, size, @music) ->
      @xDim = @yDim = size
      @score = @potentialScore = @appleCount = @turnCount = 0
      @scoreMod = Math.pow(Math.pow(20/size, 1.5) * (350/@timeStep), 1.1)
      @delay = length = Math.floor(size/3)

      @snake = new Snake @, length
      @life = new Life @

      do @addApple

    update: ->
      if @turnCount > @delay
        do @life.update
        do @render
      else
        @life.activeCells = ($('.living').length - _.size(@life.corners))

      do @snake.update
      @turnCount += 1
      @score += do @stepUpScore

    stepUpScore: -> Math.ceil(Math.log(
        @turnCount * @life.activeCells * @scoreMod / 500 + 1))

    render: ->
      @potentialScore = do @calculatePotentialScore
      $(".score").html(" " + @score)
      $(".potential").html(" + " + @potentialScore)
      do @updateClass

    addApple: ->
      loop
        coord = [
          Math.floor(Math.random()*@yDim), 
          Math.floor(Math.random()*@xDim)
        ]

        unless (@apple? and @apple.join() is coord.join()) or
                @snake.has(coord) or 
                @life.has(coord)
          break

      @appleCount += 1
      @score += @potentialScore
      @apple = coord
      $find(@apple).addClass("apple")

    calculatePotentialScore: -> _.max([0, Math.floor(
        (10 + @appleCount) * (@life.activeCells - 1) * @scoreMod)])

    updateClass: ->
      $cells = $("li")      
      $cells.removeClass("water")

      for cell in $cells
        cellArr = cell.id.split("-")
        coord = [parseInt(cellArr[1]), parseInt(cellArr[3])]

        if @snake.has(coord)
          if cell.className.indexOf("presnake") is -1
            cell.className += " presnake"
            ((cell) -> setTimeout ( -> cell.className += " snake"), 1)(cell)
        else
          cell.className = cell.className.replace( /(?:^|\s)presnake(?!\S)/ , '' )
          cell.className = cell.className.replace( /(?:^|\s)snake(?!\S)/ , '' )

        if @life.has(coord)
          if cell.className.indexOf("prelife") is -1
            cell.className += " prelife"
            ((cell) -> setTimeout ( -> cell.className += " living"), 1)(cell)
        else
          cell.className = cell.className.replace( /(?:^|\s)prelife(?!\S)/ , '' )
          cell.className = cell.className.replace( /(?:^|\s)living(?!\S)/ , '' )

    offscreen: (coord) ->
      coord[0] < 0 or coord[0] >= @yDim or coord[1] < 0 or coord[1] >= @xDim

    gameOver: ->
      $(".running-score").addClass("gone")
      $(".final-score").removeClass("gone")
      $(".info").removeClass("hidden")
      $("html").off("mousedown").off("keydown")
      if game.music
        [song, sfx] = $("audio").get()
        song.pause()
        sfx.play()
        sfx.volume = song.volume

      clearInterval(handler)
      window.game = null

    toggleLiving: (event) ->
      node = event.target
      cell = @getId(node)

      if @life.has(cell)
        $(node).addClass("water");
        $(node).removeClass("prelife living");
        delete @life.list[cell.join()];
      else
        $(node).addClass("prelife")
        setTimeout ( -> $(node).addClass("living")), 1, event
        @life.list[cell.join()] = true

    getId: (target) ->
      [parseInt($(target).attr("id").split("-")[1]),
       parseInt($(target).attr("id").split("-")[3])]

  {start: start}