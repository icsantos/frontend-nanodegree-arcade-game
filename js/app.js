// constants for stone, grass and water blocks
var BLOCK_WIDTH = 101,  // size along x-axis
  BLOCK_HEIGHT = 83,    // size along y-axis
  BLOCK_HEIGHT_OFFSET = 50;   // transparent part above the block image

// constants for the playing field
var FIELD_TOP = BLOCK_HEIGHT_OFFSET,
  FIELD_LEFT = 0,
  FIELD_BOTTOM = 400,
  FIELD_RIGHT = 400;

// Generate a random integer within a range.  We will use this for speed and coordinates.
// Source: http://stackoverflow.com/a/7228322
function randomInteger(min, max) {
  'use strict';
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function toggleAvatarSelection(enable) {
  if (enable) {
    $('input[name=player]').prop('disabled', false);
    $('label > input + img').css('cursor', 'pointer');
  } else {
    $('input[name=player]').prop('disabled', true);
    $('label > input + img').css('cursor', 'default');
  }
}

// --------------------------------------------------
// GamePiece superclass
// --------------------------------------------------
var GamePiece = function() {
  'use strict';
};

GamePiece.prototype.piece = function (obj) {
  'use strict';
  // The image/sprite uses a helper to easily load images
  this.sprite = obj.sprite;
  this.width = obj.width;
  this.height = obj.height;
};

// Place game piece in middle of randomly chosen column
GamePiece.prototype.xCoord = function (min, max) {
  'use strict';
  var randCol = randomInteger(min, max) * BLOCK_WIDTH;
  this.x = randCol + (BLOCK_WIDTH - this.width) / 2;
};

// Place game piece in middle of randomly chosen row
GamePiece.prototype.yCoord = function (min, max) {
  'use strict';
  var randRow = randomInteger(min, max) * BLOCK_HEIGHT;
  this.y = BLOCK_HEIGHT_OFFSET + randRow + (BLOCK_HEIGHT - this.height) / 2;
};

// Set the game piece's 'hit' zone for use in collision detection
GamePiece.prototype.setPerimeter = function () {
  'use strict';
  this.perimeter = {
    top: this.y,
    left: this.x,
    bottom: this.y + this.height,
    right: this.x + this.width
  };
};

// Draw the game piece on the screen
GamePiece.prototype.render = function () {
  'use strict';
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Source: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
GamePiece.prototype.hit = function (object2) {
  'use strict';
  var hit = false;
  if (this.perimeter && object2.perimeter) {
    hit = (this.perimeter.left < object2.perimeter.right &&
      this.perimeter.right > object2.perimeter.left &&
      this.perimeter.top < object2.perimeter.bottom &&
      this.perimeter.bottom > object2.perimeter.top);
  }
  return hit;
};

// --------------------------------------------------
// Enemy class
// --------------------------------------------------
var enemies = [
  {
    sprite: 'images/enemy-bug.png',
    width: 99,
    height: 66
  }, {
    // https://pixabay.com/en/handbag-bag-brown-clutch-leather-155755/
    sprite: 'images/ladybag.png',
    width: 63,
    height: 66
  }
];

var Enemy = function () {
  'use strict';
  GamePiece.call(this);
  this.reset();
};
Enemy.prototype = Object.create(GamePiece.prototype); // subclass prototype delegation
Enemy.prototype.constructor = Enemy; // reset constructor from GamePiece to Enemy

// Place enemy at one of the stone-block rows (y-axis), starting off-canvas (x-axis)
Enemy.prototype.reset = function () {
  'use strict';
  this.piece(enemies[randomInteger(1, enemies.length) - 1]);
  this.xCoord(-3, -1);
  this.yCoord(1, 3);
  this.speed = randomInteger(75, 200);
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
  this.setPerimeter();
  // Has the enemy walked off the right side?
  if (this.x > FIELD_RIGHT + BLOCK_WIDTH) {
    this.reset();
  }
  if (this.hit(player)) {
    player.updateLives(-1);
    player.reset();
  }
};

// --------------------------------------------------
// Player class
// --------------------------------------------------
// for purpose of collision detection, the height excludes the shadow
var avatars = [
  {
    id: 'char-boy',
    sprite: 'images/char-boy.png',
    width: 67,
    height: 77
  }, {
    id: 'char-cat-girl',
    sprite: 'images/char-cat-girl.png',
    width: 68,
    height: 76
  }, {
    id: 'char-horn-girl',
    sprite: 'images/char-horn-girl.png',
    width: 67,
    height: 77
  }, {
    id: 'char-pink-girl',
    sprite: 'images/char-pink-girl.png',
    width: 68,
    height: 76
  }, {
    id: 'char-princess-girl',
    sprite: 'images/char-princess-girl.png',
    width: 68,
    height: 78
  }
];

var Player = function (charId) {
  'use strict';
  GamePiece.call(this);
  var obj;
  if (typeof charId !== "undefined" && charId) {
    obj = $.grep(avatars, function(e){ return e.id === charId; })[0];
  } else {
    var index = randomInteger(1, avatars.length) - 1,
      radio = 'input[name=player]:eq(' + index + ')';
    $(radio).prop('checked', true);
    toggleAvatarSelection(false);
    obj = avatars[index];
  }
  this.piece(obj);
  this.score = 0;
  this.lives = 3;
  this.reset();
};
Player.prototype = Object.create(GamePiece.prototype); // subclass prototype delegation
Player.prototype.constructor = Player; // reset constructor from GamePiece to Player

// Place player at starting point
Player.prototype.reset = function () {
  'use strict';
  this.xCoord(0, 4);
  this.yCoord(5, 5);
  this.setPerimeter();
  this.tokenPoints = 0;
  this.tokenLives = 0;
};

// Update the player's position
Player.prototype.update = function () {
  'use strict';
  if (this.lives < 1) {
    this.gameOver();
    return 0;
  }
  // Has the player reached the water?
  if (this.y < FIELD_TOP) {
    this.updateScore(1 + this.tokenPoints);
    this.updateLives(this.tokenLives);
    this.reset();
  }
  this.setPerimeter();
  return 1;
};

// Move player in the direction selected
Player.prototype.handleInput = function (key) {
  'use strict';
  switch (key) {
  case 'up':
    this.y -= (this.y > FIELD_TOP) ? BLOCK_HEIGHT : 0;
    break;
  case 'left':
    this.x -= (this.x - BLOCK_WIDTH > FIELD_LEFT) ? BLOCK_WIDTH : 0;
    break;
  case 'down':
    this.y += (this.y < FIELD_BOTTOM) ? BLOCK_HEIGHT : 0;
    break;
  case 'right':
    this.x += (this.x < FIELD_RIGHT) ? BLOCK_WIDTH : 0;
    break;
  }
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
  this.lives = (this.lives + lives >= 5) ? 5 : this.lives + lives ;
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
};

// --------------------------------------------------
// Token class
// --------------------------------------------------
var tokens = [
  {
    sprite: 'images/Gem Blue.png',
    width: 50,
    height: 54,
    points: 2,
    lives: 0
  }, {
    sprite: 'images/Gem Green.png',
    width: 50,
    height: 54,
    points: 4,
    lives: 0
  }, {
    sprite: 'images/Gem Orange.png',
    width: 50,
    height: 54,
    points: 8,
    lives: 0
  }, {
    sprite: 'images/Key.png',
    width: 50,
    height: 50,
    points: 16,
    lives: 0
  }, {
    sprite: 'images/Star.png',
    width: 29,
    height: 42,
    points: 32,
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
  GamePiece.call(this);
  this.reset();
};
Token.prototype = Object.create(GamePiece.prototype); // subclass prototype delegation
Token.prototype.constructor = Token; // reset constructor from GamePiece to Token

// Token will be placed on a stone-block
Token.prototype.reset = function () {
  'use strict';
  var obj = tokens[randomInteger(1, tokens.length) - 1];
  this.piece(obj);
  this.pointsOnhold = obj.points;
  this.livesOnhold = obj.lives;
  this.points = 0;
  this.lives = 0;
  this.delay = randomInteger(2, 10) * 10000;
  this.fadeTime = randomInteger(5, 10) * 10000;
  this.alphaDivisor = this.fadeTime;
  this.xCoord(0, 4);
  this.yCoord(1, 3);
};

// Update the token's position
Token.prototype.update = function () {
  'use strict';
  this.setPerimeter();
  if (this.hit(player)) {
    player.tokenPoints += this.points;
    player.tokenLives += this.lives;
    this.reset();
  }
};

// Draw the token on the screen
Token.prototype.render = function () {
  'use strict';
  this.delay -= 100;
  if (this.delay <= 0) {
    this.points = this.pointsOnhold;
    this.lives = this.livesOnhold;
    this.fadeTime -= 100;
    if (this.fadeTime <= 0) {
      this.reset();
    } else {
      ctx.globalAlpha = this.fadeTime / this.alphaDivisor;
      GamePiece.prototype.render.call(this);
      ctx.globalAlpha = 1.0;
    }
  }
};

// --------------------------------------------------
// Instantiate objects
// --------------------------------------------------
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()],
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

// TODO Player selects avatar
$('input[name="player"]').change(function() {
  'use strict';
  console.log($(this).val());
  var player = new Player($(this).val());
});
