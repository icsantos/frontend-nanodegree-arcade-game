// constants
var BLOCK_WIDTH = 101,  // canvas.perimeter.colSize
  BLOCK_HEIGHT = 83,    // canvas.perimeter.rowSize
  BLOCK_HEIGHT_OFFSET = 50;   // invisible part above the stone, grass and water blocks

// Generate a random integer within a range.  We will use this for speed and coordinates.
// Source: http://stackoverflow.com/a/7228322
function randomInteger(min, max) {
  'use strict';
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Determine middle of randomly chosen column
function xCoord(min, max, objWidth) {
  'use strict';
  var randCol = randomInteger(min, max),
    left = randCol * BLOCK_WIDTH,
    middle = left + (BLOCK_WIDTH - objWidth) / 2;
  return middle;
}

// Place object in middle of randomly chosen row
function yCoord(min, max, objHeight) {
  'use strict';
  var randRow = randomInteger(min, max),
    top = randRow * BLOCK_HEIGHT,
    middle = top + (BLOCK_HEIGHT - objHeight) / 2;
  return middle + BLOCK_HEIGHT_OFFSET;
}

// Set the object's 'hit' zone for use in collision detection
function objectPerimeter(object) {
  'use strict';
  var left = object.x,
    right = left + object.width,
    top = object.y,
    bottom = top + object.height;
  return {
    top: top,
    left: left,
    bottom: bottom,
    right: right
  };
}

// Source: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function objectsCollided(object1, object2) {
  'use strict';
  var collided = false;
  if (object1.perimeter && object2.perimeter) {
    collided = (object1.perimeter.left < object2.perimeter.right &&
      object1.perimeter.right > object2.perimeter.left &&
      object1.perimeter.top < object2.perimeter.bottom &&
      object1.perimeter.bottom > object2.perimeter.top);
  }
  return collided;
}

// --------------------------------------------------
// Enemy class
// --------------------------------------------------
var Enemy = function () {
  'use strict';
  // The image/sprite for our enemies, this uses a helper to easily load images
  this.sprite = 'images/enemy-bug.png';
  this.width = 99;
  this.height = 66;  // excluding the shadow
  this.reset();
};

// Place enemy at one of the stone-block rows (y-axis), starting off-canvas (x-axis)
Enemy.prototype.reset = function () {
  'use strict';
  this.speed = randomInteger(75, 200);
  this.x = xCoord(-3, -1, this.width);
  this.y = yCoord(1, 3, this.height);
};

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
  'use strict';
  // Multiply any movement by the dt parameter to ensure
  // the game runs at the same speed for all computers.
  this.x += this.speed * dt;
  // give the bug a little up-and-down jiggle
  this.y += randomInteger(-1, 1) / 3;
  this.perimeter = objectPerimeter(this);
  // Has the enemy walked off the right side?
  if (this.x > canvas.perimeter.right + BLOCK_WIDTH) {
    this.reset();
  }
  if (objectsCollided(player, this)) {
    player.updateLives(-1);
    player.reset();
  }
};

// Draw the enemy on the screen
Enemy.prototype.render = function () {
  'use strict';
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// --------------------------------------------------
// Player class
// --------------------------------------------------
var Player = function () {
  'use strict';
  // The image/sprite for our player, this uses a helper to easily load images
  this.sprite = 'images/char-boy.png';
  this.width = 67;
  this.height = 77;  // excluding the shadow
  this.score = 0;
  this.lives = 3;
  this.reset();
};

// Place player at starting point
Player.prototype.reset = function () {
  'use strict';
  this.x = xCoord(0, 4, this.width);
  this.y = yCoord(5, 5, this.height);
  if (this.lives < 1) {
    this.gameOver();
  }
};

// Update the player's position
Player.prototype.update = function () {
  'use strict';
  // Has the player reached the water?
  if (this.y < canvas.perimeter.top) {
    this.updateScore(1);
    this.reset();
  }
  this.perimeter = objectPerimeter(this);
};

// Move player in the direction selected
Player.prototype.handleInput = function (key) {
  'use strict';
  switch (key) {
  case 'up':
    this.y -= (this.y > canvas.perimeter.top) ? BLOCK_HEIGHT : 0;
    break;
  case 'left':
    this.x -= (this.x > canvas.perimeter.left) ? BLOCK_WIDTH : 0;
    break;
  case 'down':
    this.y += (this.y < canvas.perimeter.bottom) ? BLOCK_HEIGHT : 0;
    break;
  case 'right':
    this.x += (this.x < canvas.perimeter.right) ? BLOCK_WIDTH : 0;
    break;
  }
};

// Draw the player on the screen, required method for game
Player.prototype.render = function () {
  'use strict';
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Update the player's score
Player.prototype.updateScore = function (score) {
  'use strict';
  this.score += score;
  $('#score').text(this.score);
};

// Update the player's lives
Player.prototype.updateLives = function (lives) {
  'use strict';
  this.lives += (this.lives + lives <= 5) ? lives : 0;
  $('img.life').each(function (index) {
    if (index < player.lives) {
      $(this).removeClass('inactive').addClass('active');
    } else {
      $(this).removeClass('active').addClass('inactive');
    }
  });
};

// No more lives
Player.prototype.gameOver = function () {
  'use strict';
  $('#score').text("Your Score: " + this.score);
  ctx.textAlign = "center";
  ctx.textBaseline = "hanging";
  ctx.font = "bold italic 4em 'Gochi Hand'";
  ctx.fillStyle = "red";
  ctx.fillText("awww", canvas.width / 2, this.y);
  ctx.fillText("game over", canvas.width / 2, this.y + 60);
  ctx.strokeStyle = "yellow";
  ctx.strokeText("awww", canvas.width / 2, this.y);
  ctx.strokeText("game over", canvas.width / 2, this.y + 60);
  window.cancelAnimationFrame(reqID);
};

// --------------------------------------------------
// Token class
// --------------------------------------------------
var Tokens = [
  {
    sprite: 'images/Gem Blue.png',
    width: 50,
    height: 54,
    points: 5,
    lives: 0
  }, {
    sprite: 'images/Gem Green.png',
    width: 50,
    height: 54,
    points: 10,
    lives: 0
  }, {
    sprite: 'images/Gem Orange.png',
    width: 50,
    height: 54,
    points: 15,
    lives: 0
  }, {
    sprite: 'images/Star.png',
    width: 50,
    height: 50,
    points: 25,
    lives: 0
  }, {
    sprite: 'images/Heart.png',
    width: 45,
    height: 45,
    points: 0,
    lives: 1
  }
];

var Token = function () {
  'use strict';
  this.reset();
};

// Token will be placed at a stone-block
Token.prototype.reset = function () {
  'use strict';
  var index = randomInteger(0, Tokens.length - 1),
    obj = Tokens[index];
  this.sprite = obj.sprite;
  this.width = obj.width;
  this.height = obj.height;
  this.points = obj.points;
  this.lives = obj.lives;
  this.duration = randomInteger(100, 200);
  this.speed = 0;
  this.x = xCoord(0, 4, this.width);
  this.y = yCoord(1, 3, this.height);
};

// Update the token's position
Token.prototype.update = function () {
  'use strict';
  this.perimeter = objectPerimeter(this);
  if (objectsCollided(player, this)) {
    player.updateScore(this.points);
    player.updateLives(this.lives);
    this.reset();
  }
};

// Draw the token on the screen
Token.prototype.render = function () {
  'use strict';
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
};




// --------------------------------------------------
// Instantiate objects
// --------------------------------------------------
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()],
  player = new Player(),
  token = new Token();

// --------------------------------------------------
// Event Listeners
// --------------------------------------------------
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
  'use strict';
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
