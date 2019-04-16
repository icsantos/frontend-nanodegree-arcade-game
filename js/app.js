/* eslint-disable id-length */
/**
 * Size of a stone, grass or water block along x-axis.
 * @constant
 * @type {number}
 * @default
 */
const BLOCK_WIDTH = 101;

/**
 * Size of a stone, grass or water block along y-axis.
 * @constant
 * @type {number}
 * @default
 */
const BLOCK_HEIGHT = 83;

/**
 * Transparent part of a stone, grass or water block above the block image.
 * @constant
 * @type {number}
 * @default
 */
const BLOCK_HEIGHT_OFFSET = 50;

/**
 * Top of the playing field.
 * @constant
 * @type {number}
 * @default BLOCK_HEIGHT_OFFSET
 */
const FIELD_TOP = BLOCK_HEIGHT_OFFSET;

/**
 * Left side of the playing field.
 * @constant
 * @type {number}
 * @default
 */
const FIELD_LEFT = 0;

/**
 * Bottom of the playing field.
 * @constant
 * @type {number}
 * @default
 */
const FIELD_BOTTOM = 400;

/**
 * Right side of the playing field.
 * @constant
 * @type {number}
 * @default
 */
const FIELD_RIGHT = 400;

/**
 * Generate a random integer between <tt>min</tt> and <tt>max</tt>
 * to use for speed and coordinates.
 * @param {number} min - The lower bound; this can be a negative value.
 * @param {number} max - The upper bound.
 * @returns {number} - A random integer
 */
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Toggle on or off the selection of the player's avatar.
 * @param {boolean} enable - <em>true</em> | <em>false</em>
 *   <p>Set it to <em>true</em> to allow the player to pick an avatar.</p>
 *   <p>Set it to <em>false</em> during game play.</p>
 * @returns {undefined}
 */
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
/**
 * @constructor
 * @classdesc A superclass of the playing pieces we can use in the game.  It requires
 * [jQuery]{@link http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js},
 * {@link resources.js} and {@link engine.js}.
 * @requires jquery.min.js
 * @requires resources.js
 * @requires engine.js
 * @property {string} sprite - The URL of the image sprite.  The image/sprite uses a helper to easily load images.
 * @property {number} height - The height of the image sprite.
 * @property {number} width - The width of the image sprite.
 * @property {number} x - The location of the game piece on the x-axis.
 * @property {number} y - The location of the game piece on the y-axis.
 * @property {object} perimeter - The boundaries of the game piece on the x-axis and y-axis.
 * @property {number} perimeter.top - The top of the game piece.
 * @property {number} perimeter.left - The left side of the game piece.
 * @property {number} perimeter.bottom - The bottom of the game piece.
 * @property {number} perimeter.right - The right side of the game piece.
 * @returns {undefined}
 */
class GamePiece {
  constructor() {
    'use strict';
  }

  /**
   * Method that sets the sprite, width and height properties of a game piece.
   * @param {avatars|enemies|tokens} obj - An object containing the image sprite URL, width and height.
   * @property {string} sprite - The URL of the image sprite.  The image/sprite uses a helper to easily load images.
   * @property {number} width - The width of the image sprite.
   * @property {number} height - The height of the image sprite.
   * @returns {undefined}
   */
  piece(obj) {
    this.sprite = obj.sprite;
    this.width = obj.width;
    this.height = obj.height;
  }

  /**
   * Place the game piece in the middle of a randomly chosen column.
   * @param {number} min - The lower bound; this can be a negative value.
   * @param {number} max - The upper bound.
   * @property {number} x - The location of the game piece on the x-axis.
   * @returns {undefined}
   */
  xCoord(min, max) {
    var randCol = randomInteger(min, max) * BLOCK_WIDTH;
    this.x = randCol + (BLOCK_WIDTH - this.width) / 2;
  }

  /**
   * Place the game piece in the middle of a randomly chosen row.
   * @param {number} min - The lower bound; keep it between 1 and 5.
   * @param {number} max - The upper bound; keep it between 1 and 5.
   * @property {number} y - The location of the game piece on the y-axis.
   * @returns {undefined}
   */
  yCoord(min, max) {
    var randRow = randomInteger(min, max) * BLOCK_HEIGHT;

    this.y = BLOCK_HEIGHT_OFFSET + randRow + (BLOCK_HEIGHT - this.height) / 2;
  }

  /**
   * Set the game piece's 'hit' zone for use in collision detection.
   * @property {object} perimeter - The boundaries of the game piece on the x-axis and y-axis.
   * @property {number} perimeter.top - The top of the game piece.
   * @property {number} perimeter.left - The left side of the game piece.
   * @property {number} perimeter.bottom - The bottom of the game piece.
   * @property {number} perimeter.right - The right side of the game piece.
   * @returns {undefined}
   */
  setPerimeter() {
    this.perimeter = {
      'top': this.y,
      'left': this.x,
      'bottom': this.y + this.height,
      'right': this.x + this.width
    };
  }

  /**
   * Draw the game piece on the screen.
   * @returns {undefined}
   */
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }

  /**
   * Detect if this game piece was hit by another game piece.
   * @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
   * @param {object} object2 - An object representing a second game piece
   * @returns {boolean} <em>true</em> | <em>false</em>
   * @default <em>false</em>
   */
  hit(object2) {
    let hit = false;

    if (this.perimeter && object2.perimeter) {
      hit = this.perimeter.left < object2.perimeter.right &&
        this.perimeter.right > object2.perimeter.left &&
        this.perimeter.top < object2.perimeter.bottom &&
        this.perimeter.bottom > object2.perimeter.top;
    }

    return hit;
  }
}

// --------------------------------------------------
// Enemy class
// --------------------------------------------------
/**
 * Array of objects that will be used to instantiate an enemy game piece
 * @typedef {object} enemies
 * @type {Object[]}
 * @property {string} sprite - The URL of the image sprite.
 * @property {number} width - The width of the image sprite.
 * @property {number} height - The height of the image sprite.
 * @example
 * var enemies = [
 *   {
 *     sprite: 'images/enemy-bug.png',
 *     width: 99,
 *     height: 66
 *   }, {
 *     sprite: 'images/ladybag.png',
 *     width: 63,
 *     height: 66
 *   }
 * ];
 */
const enemies = [
  {
    'sprite': 'images/enemy-bug.png',
    'width': 99,
    'height': 66
  }, {
    // https://pixabay.com/en/handbag-bag-brown-clutch-leather-155755/
    'sprite': 'images/ladybag.png',
    'width': 63,
    'height': 66
  }
];

/**
 * @constructor
 * @extends GamePiece
 * @property {number} speed - The initial speed of the enemy game piece.
 */
class Enemy {
  constructor() {
    GamePiece.call(this);
    this.reset();
  }

  /**
   * Place enemy at one of the stone-block rows (y-axis), starting off-canvas (x-axis)
   * @property {number} speed - The initial speed of the enemy game piece.
   * @returns {undefined}
   */
  reset() {
    this.piece(enemies[randomInteger(1, enemies.length) - 1]);
    this.xCoord(-3, -1);
    this.yCoord(1, 3);
    this.speed = randomInteger(75, 200);
  }

  /**
   * This method:
   * <ul>
   * <li>Updates the enemy's position and perimeter.
   * <li>Checks if the enemy has walked off the playing field.
   * <li>Checks if the enemy hit the player.
   * </ul>
   * @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
   * @param {number} dt - A time delta between ticks
   * @returns {undefined}
   */
   update(dt) {
    // Multiply any movement by the dt parameter to ensure the game runs at the same speed for all computers.
    this.x += this.speed * dt;
    // Give the bug a little up-and-down jiggle
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
  }
}

// Subclass prototype delegation
Enemy.prototype = Object.create(GamePiece.prototype);
// Reset constructor from GamePiece to Enemy
Enemy.prototype.constructor = Enemy;

// --------------------------------------------------
// Player class
// --------------------------------------------------
/**
 * Array of objects that will be used to instantiate a player game piece
 * @typedef {object} avatars
 * @type {Object[]}
 * @property {string} id - The "value" of the corresponding radio button in index.html.
 * @property {string} sprite - The URL of the image sprite.
 * @property {number} width - The width of the image sprite.
 * @property {number} height - The height of the image sprite. For purpose of collision detection, the height excludes the shadow.
 * @example
 * var avatars = [
 *   {
 *     id: 'char-boy',
 *     sprite: 'images/char-boy.png',
 *     width: 67,
 *     height: 77
 *   }, {
 *     id: 'char-cat-girl',
 *     sprite: 'images/char-cat-girl.png',
 *     width: 68,
 *     height: 76
 *   }
 * ];
 */
const avatars = [
  {
    'id': 'char-boy',
    'sprite': 'images/char-boy.png',
    'width': 67,
    'height': 77
  }, {
    'id': 'char-cat-girl',
    'sprite': 'images/char-cat-girl.png',
    'width': 68,
    'height': 76
  }, {
    'id': 'char-horn-girl',
    'sprite': 'images/char-horn-girl.png',
    'width': 67,
    'height': 77
  }, {
    'id': 'char-pink-girl',
    'sprite': 'images/char-pink-girl.png',
    'width': 68,
    'height': 76
  }, {
    'id': 'char-princess-girl',
    'sprite': 'images/char-princess-girl.png',
    'width': 68,
    'height': 78
  }
];

/**
 * This function:
 * <ul>
 * <li>Constructs a GamePiece of avatars type.
 * <li>Selects the avatar to use (if one is not specified) and uses jQuery to indicate the selected avatar.
 * <li>Calls GamePiece.piece() to set the sprite, height and width properties.
 * <li>Initializes the score and lives properties.
 * </ul>
 * @constructor
 * @extends GamePiece
 * @property {number} score - The number of points scored by the player.
 * @property {number} lives - The number of lives remaining for the player.
 * @param {string} [charId] - An optional parameter identifying the avatars.id to use. If not provided, an avatar will be randomly chosen.
 * @returns {undefined}
 */
class Player {
  constructor(charId) {
    GamePiece.call(this);

    let obj = {};

    if (typeof charId !== 'undefined' && charId) {
      obj = avatars.find((avatar) => avatar.id === charId);
    } else {
      const index = randomInteger(1, avatars.length) - 1;
      const radio = `input[name=player]:eq(${index})`;

      $(radio).prop('checked', true);
      toggleAvatarSelection(false);
      obj = avatars[index];
    }
    this.piece(obj);
    this.score = 0;
    this.lives = 3;
    this.reset();
  }

  /**
   * This method:
   * <ul>
   * <li>Calls GamePiece.xCoord() and GamePiece.yCoord() to set starting position of the player.
   * <li>Calls GamePiece.setPerimeter() to set the player's hit zone.
   * <li>Initializes the tokenPoints and tokenLives properties.
   * </ul>
   * @property {number} tokenPoints - The number of banked points accumulated by picking up tokens.
   * @property {number} tokenLives - The number of banked lives accumulated by picking up tokens.
   * @returns {undefined}
   */
  reset() {
    this.xCoord(0, 4);
    this.yCoord(5, 5);
    this.setPerimeter();
    this.tokenPoints = 0;
    this.tokenLives = 0;
  }

  /**
   * This method:
   * <ul>
   * <li>Checks if the player has zero lives and if so, calls gameOver().
   * <li>Checks if the player has reached the safety zone and if so,
   *   <ul>
   *   <li>Updates score by calling <tt>updateScore(1 + this.tokenPoints)</tt>
   *   <li>Updates lives by calling <tt>updateLives(this.tokenLives)</tt>
   *   <li>Places the player back to the starting position by calling <tt>reset()</tt>.
   *   </ul>
   * </ul>
   * @returns {integer} - Number of lives
   */
  update() {
    if (this.lives < 1) {
      this.gameOver();

      return 0;
    }
    // Has the player reached the safety zone?
    if (this.y < FIELD_TOP) {
      this.updateScore(1 + this.tokenPoints);
      this.updateLives(this.tokenLives);
      this.reset();
    }
    this.setPerimeter();

    return 1;
  }

  /**
   * This method:
   * <ul>
   * <li>Updates the x coordinate if the player pressed the left or right movement key.
   * <li>Updates the y coordinate if the player pressed the up or down movement key.
   * </ul>
   * @listens module:addEventListener~keyup
   * @param {string} key - The key pressed by the player.
   * @returns {undefined}
   */
  handleInput(key) {
    switch (key) {
      case 'up':
        this.y -= this.y > FIELD_TOP ? BLOCK_HEIGHT : 0;
        break;
      case 'left':
        this.x -= this.x - BLOCK_WIDTH > FIELD_LEFT ? BLOCK_WIDTH : 0;
        break;
      case 'down':
        this.y += this.y < FIELD_BOTTOM ? BLOCK_HEIGHT : 0;
        break;
      case 'right':
        this.x += this.x < FIELD_RIGHT ? BLOCK_WIDTH : 0;
        break;
      default:
      // Do nothing
    }
  }

  /**
   * This method:
   * <ul>
   * <li>Adds the value specified in the parameter to the score.
   * <li>Uses jQuery to display the score on the page.
   * </ul>
   * @param {number} score - The number of points to add to the player's score.
   * @returns {undefined}
   */
  updateScore(score) {
    this.score += score;
    $('#score').text(this.score);
  }

  /**
   * This method:
   * <ul>
   * <li>Adds the value specified in the parameter to the player's lives, up to a maximum of 5.
   * <li>Uses jQuery to display the number of lives on the page, represented by the number of visible heart images.
   * </ul>
   * @param {number} lives - The number of lives to add to or deduct from the player's lives.
   * @returns {undefined}
   */
  updateLives(lives) {
    this.lives = Math.min(this.lives + lives, 5);
    $('img.life').each(function (index) {
      if (index < player.lives) {
        $(this).removeClass('inactive');
      } else {
        $(this).addClass('inactive');
      }
    });
  }

  /**
   * This method displays the final score on the page.
    * @returns {undefined}
  */
  gameOver() {
    $('#score').text(`Your Score: ${this.score}`);
  }
}

// Subclass prototype delegation
Player.prototype = Object.create(GamePiece.prototype);
// Reset constructor from GamePiece to Player
Player.prototype.constructor = Player;

// --------------------------------------------------
// Token class
// --------------------------------------------------
/**
 * Array of objects that will be used to instantiate a token game piece
 * @typedef {object} tokens
 * @type {Object[]}
 * @property {string} sprite - The URL of the image sprite.
 * @property {number} width - The width of the image sprite.
 * @property {number} height - The height of the image sprite. For purpose of collision detection, the height excludes the shadow.
 * @property {number} points - The number of points added when the token is taken to the safety zone.
 * @property {number} lives - The number of lives added when the token is taken to the safety zone.
 * @example
 * var avatars = [
 *   {
 *     sprite: 'images/Gem Blue.png',
 *     width: 50,
 *     height: 54,
 *     points: 2,
 *     lives: 0
 *   }, {
 *     sprite: 'images/Heart.png',
 *     width: 45,
 *     height: 45,
 *     points: 0,
 *     lives: 1
 *   }
 * ];
 */
const tokens = [
  {
    'sprite': 'images/Gem Blue.png',
    'width': 50,
    'height': 54,
    'points': 2,
    'lives': 0
  }, {
    'sprite': 'images/Gem Green.png',
    'width': 50,
    'height': 54,
    'points': 4,
    'lives': 0
  }, {
    'sprite': 'images/Gem Orange.png',
    'width': 50,
    'height': 54,
    'points': 8,
    'lives': 0
  }, {
    'sprite': 'images/Key.png',
    'width': 50,
    'height': 50,
    'points': 16,
    'lives': 0
  }, {
    'sprite': 'images/Star.png',
    'width': 29,
    'height': 42,
    'points': 32,
    'lives': 0
  }, {
    'sprite': 'images/Heart.png',
    'width': 45,
    'height': 45,
    'points': 0,
    'lives': 1
  }
];

/**
 * This function constructs a GamePiece of tokens type.
 * @constructor
 * @extends GamePiece
 * @returns {undefined}
 */
class Token {
  constructor() {
    GamePiece.call(this);
    this.reset();
  }

  /**
   * This method:
   * <ul>
   * <li>Randomly selects the token to use.
   * <li>Calls GamePiece.piece() to set the sprite, height and width properties.
   * <li>Calls GamePiece.xCoord() and GamePiece.yCoord() to set the position of the token.  The token will be placed on a stone-block.
   * <li>Initializes the points, lives, delay, fadeTime and alphaDivisor properties.
   * </ul>
   * @property {number} points - The number of points the token is worth.
   * @property {number} lives - The number of lives the token is worth.
   * @property {number} delay - How long to wait before rendering the token.
   * @property {number} fadeTime - How long it will take before the token fades completely from view.
   * @property {number} alphaDivisor - This will be used for setting the globalAlpha before rendering the token.
   * @returns {undefined}
   */
  reset() {
    const obj = tokens[randomInteger(1, tokens.length) - 1];

    this.piece(obj);
    this.points = obj.points;
    this.lives = obj.lives;
    this.delay = randomInteger(2, 10) * 10000;
    this.fadeTime = randomInteger(5, 10) * 10000;
    this.alphaDivisor = this.fadeTime;
    this.xCoord(0, 4);
    this.yCoord(1, 3);
  }

  /**
   * This method:
   * <ul>
   * <li>Calls GamePiece.setPerimeter() to set the token's hit zone.
   * <li>Checks if the delay has expired and if the token was hit by the player, and if so:
   *   <ul>
   *   <li>Bank the points by adding token.points to player.tokenPoints.
   *   <li>Bank the lives by adding token.lives to player.tokenLives.
   *   <li>Prepare another token by calling the reset() method.
   *   </ul>
   * </ul>
   * @property {number} tokenPoints - The number of banked points accumulated by picking up tokens.
   * @property {number} tokenLives - The number of banked lives accumulated by picking up tokens.
   * @returns {undefined}
   */
  update() {
    this.setPerimeter();
    if (this.delay <= 0 && this.hit(player)) {
      player.tokenPoints += this.points;
      player.tokenLives += this.lives;
      this.reset();
    }
  }

  /**
   * This method:
   * <ul>
   * <li>Deducts 100 from the delay property.
   * <li>If the delay is more than zero, it does nothing else.
   * <li>If the delay has reached zero or below, it deducts 100 from the fadeTime property.
   * <li>If the fadeTime is more than zero, it adjusts the globalAlpha, calls the GamePiece.prototype.render() method, then resets the globalAlpha to 1.
   * <li>If the fadeTime has reached zero or below, it calls the token's reset() method.
   * </ul>
   */
  // Draw the token on the screen
  render() {
    this.delay -= 100;
    if (this.delay <= 0) {
      this.fadeTime -= 100;
      if (this.fadeTime <= 0) {
        this.reset();
      } else {
        ctx.globalAlpha = this.fadeTime / this.alphaDivisor;
        GamePiece.prototype.render.call(this);
        ctx.globalAlpha = 1.0;
      }
    }
  }
}

// Subclass prototype delegation
Token.prototype = Object.create(GamePiece.prototype);
// Reset constructor from GamePiece to Token
Token.prototype.constructor = Token;

// --------------------------------------------------
// Instantiate objects
// --------------------------------------------------
/**
 * Array of instances of the Enemy class
 * @type {Enemy[]}
 */
const allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()];

/**
 * An instance of the Player class
 * @type {Player}
 */
let player = new Player();

/**
 * An instance of the Token class
 * @type {Token}
 */
const token = new Token();

// --------------------------------------------------
// Event Listeners
// --------------------------------------------------
/**
 * Event listener that listens for key presses and sends the keys to
 * the Player.handleInput() method.
 * @event module:addEventListener~keyup
 * @function addEventListener
 * @global
 */
document.addEventListener('keyup', function (event) {
  var allowedKeys = {
    '37': 'left',
    '38': 'up',
    '39': 'right',
    '40': 'down'
  };

  player.handleInput(allowedKeys[event.keyCode]);
});

/// TODO Player selects avatar
$(document).ready(function () {
  $('input[name=player]:radio').change(function() {
    const avatar = $('input[name=player]:checked').val();

    alert(avatar);
    player = new Player(avatar);
  });
});
