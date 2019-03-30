document.addEventListener("DOMContentLoaded", function () {
    window.requestAnimationFrame(function () {
      var manager = new Game(4);
    });
  });

//The main game manager;
function Game(size)
{
    this.size = size;
    this.box = $('.box');

    this.colormap = {
        0: "#C0C0C0" ,
        2: "#FFFFFF" ,
        4: "#ECC5A8" ,
        8: "#E0CC97" ,
        16: "#E1B378" ,
        32: "#C9341C" ,
        64: "#FFFF66" ,
        128: "#FFCC00" ,
        256: "#FF9900" ,
        512: "#A16B23" ,
        1024: "#CC6600" ,
        2048: "#C13100" ,
    }

    this.keymap = {
        38: 1, // Up
        39: 2, // Right
        40: 3, // Down
        37: 4, // Left
    };

    this.prepareBoard();

    this.setup();
}

//Prepares the game board
Game.prototype.prepareBoard = function(){
    this.box.css({  "grid-template-columns": `repeat(${this.size}, auto)` , "grid-template-rows": `repeat(${this.size}, auto)`});
    for(let i=0; i<this.size*this.size;i++)
    {
        this.box.append(`<div class="grid" id = "${i}">&nbsp;</div>`);
    }
    $('.grid').css("font-size" , `${6*4/(this.size)}vmin`);$('.grid').css("line-height" , `${18*4/(this.size)}vmin`);
};

//Setup the game
Game.prototype.setup = function(){
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;

    this.addStartTiles();
    this.updateBoard();

    document.addEventListener("keydown" , this.keyPress.bind(this));
};

// Set up the initial tiles to start the game with
Game.prototype.addStartTiles = function () {
    
    for (var i = 0; i < 2; i++) {
      this.addRandomTile();
    }
  };
  
  // Adds a tile in a random position
  Game.prototype.addRandomTile = function () {
    if (this.grid.checkAvailable()) {
      var value = Math.random() < 0.8 ? 2 : 4;
      var position = this.grid.randomCell();
      var tile = new Tile(position, value);
      this.grid.insertTile(tile);
    }
  };

  //Updates the game board
  Game.prototype.updateBoard= function () {
    var self = this;

    window.requestAnimationFrame(function(){
        self.clearBoard();
        self.grid.cells.forEach(function(col){
            col.forEach(function(cell){
                if(cell)
                    self.addTile(cell);
            });
        });

        self.updateScore();
    }
    )
};

//Clears the board
Game.prototype.clearBoard = function(){
    for(var i = 0 ; i<this.size*this.size ; i++)
        {
            $(`#${i}`).html("&nbsp;");
            document.getElementById(`${i}`).style.backgroundColor = this.colormap[0];
        }
};

//Add Tile to Board
Game.prototype.addTile = function(tile){
    position = tile.x*this.size + tile.y;
    document.getElementById(`${position}`).innerHTML = `${tile.value}`;
    document.getElementById(`${position}`).style.backgroundColor = this.colormap[Math.min(2048,tile.value)];
}

//Updates the score board 
Game.prototype.updateScore = function(){
    document.getElementById("info").innerHTML = `Score : ${this.score}`;
}

Game.prototype.keyPress = function(event){
    if(this.keymap[event.which])
    {
        event.preventDefault();
        this.move(this.keymap[event.which]);
    }
};

// Removes merger info
Game.prototype.prepareTiles = function () {
    for(var i=0 ; i<this.size ; i++)
    {
        for(var j=0 ; j<this.size ; j++)
        {
            if (this.grid.cells[i][j]) {
                this.grid.cells[i][j].mergedFrom = null;
              }
        }
    }
};

Game.prototype.moveTile = function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.x = cell.x; tile.y=cell.y;
  };

// Move tiles on the grid in the specified direction
Game.prototype.move = function (direction) {
    var self = this;
  
    var cell, tile;
  
    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;

    this.prepareTiles();

    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = self.grid.cellContent(cell);
  
        if (tile) {
            next =null;
            var positions = self.findFarthestPosition(cell, vector);

            if (positions.next)
                var next = self.grid.cellContent(positions.next);

            if((tile.x!=positions.farthest.x)||(tile.y!=positions.farthest.y))
                moved = true
            
            self.moveTile(tile, positions.farthest);

            if (next && next.value === tile.value && !next.mergedFrom) {
                var merged = new Tile(positions.next, tile.value * 2);
                merged.mergedFrom = [tile, next];

                self.grid.insertTile(merged);
                self.grid.removeTile(tile);

                tile.x = positions.next.x ; tile.y = positions.next.y;
                self.score += merged.value;

                moved = true;
            }
        }
      });
    });

    if(moved==true){
        this.updateBoard();
        this.addRandomTile();
        setTimeout(this.updateBoard.bind(this) , 100);
    }

  };

//To handle game over
Game.prototype.gameOver = function()
{
    this.over = true;
    $(".cover").css("display" , "block");
    $(".txt").css("display" , "block");
}


// Get the vector representing the chosen direction
Game.prototype.getVector = function (direction) {
    var map = {
      1: { x: -1,  y: 0 }, // up
      2: { x: 0,  y: 1 },  // right
      3: { x: 1,  y: 0 },  // down
      4: { x: 0, y: -1 }   // left
    };
    return map[direction];
  };

//Gets the farthest available position is direction of motion 
Game.prototype.findFarthestPosition = function (cell, vector) {
    var previous , next;
    next = null;
    do {
        previous = cell;
        cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while ((cell.x>=0)&&(cell.x<this.size)&&(cell.y>=0)&&(cell.y<this.size)&&(this.grid.cells[cell.x][cell.y]==null));

    if((cell.x>=0)&&(cell.x<this.size)&&(cell.y>=0)&&(cell.y<this.size)) 
        next = cell;

    return {
        farthest: previous,
        next: next 
    };
};

// Build a list of positions to traverse in the right order
Game.prototype.buildTraversals = function (vector) {
    var traversals = { x: [], y: [] };
    l = this.size;
  
    for (var i = 0; i < l; i++) {
      traversals.x.push(i);
      traversals.y.push(i);
    }

    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
  
    return traversals;
  };

//-------------------------------------------------------------------------//


//Each object of the grid
function Tile(position , value)
{
    this.x = position.x;
    this.y = position.y;
    this.value = value;

    this.merged_from = null;
}

//--------------------------------------------------------------------------//

//The grid on screen 
function Grid(size)
{
    this.size=size;
    this.cells = [];
    
    this.build();
}

//Initialization of cell to all empty
Grid.prototype.build = function(){
    for(var i=0 ;i<this.size ; i++)
    {
        this.cells[i] = [];
        for(var j=0;j<this.size ; j++)
            this.cells[i][j] = null;
    }
};

//Returns list of available cells
Grid.prototype.availableCell = function(){
    var avail = [];
    for(var i = 0 ; i<this.size ; i++)
    {
        for(var j = 0 ; j<this.size ; j++)
        {
            if(this.cells[i][j]==null)
                {avail.push({x:i , y:j});}
        }
    }

    return avail;
};

//Checks if there are any available cells
Grid.prototype.checkAvailable = function(){
    return !!this.availableCell().length;
};

//Returns a random Tile
Grid.prototype.randomCell = function(){
    var avail = this.availableCell();
    if(this.checkAvailable())
        return avail[Math.floor(Math.random()*avail.length)];
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
    return !this.cells[cell.x][cell.y];
  };

//returns content of cell
Grid.prototype.cellContent = function (cell) {
    return this.cells[cell.x][cell.y];
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
this.cells[tile.x][tile.y] = tile;
};

//Removes a tile from position
Grid.prototype.removeTile = function (tile) {
this.cells[tile.x][tile.y] = null;
};