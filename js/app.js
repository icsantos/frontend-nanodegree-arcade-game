// Generate a random integer within a range.  We will use this for the Enemy speed and y coordinate.
// Source: http://stackoverflow.com/a/7228322
function randomInteger(min, max) {
    'use strict';
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Set the object's 'hit' zone for use in collision detection
function objectPerimeter(object) {
    'use strict';
    var left = object.x + ((canvas.perimeter.colSize - object.width) / 2);
    var right = left + object.width;
    var top = object.y + ((canvas.perimeter.rowSize - object.height) / 2);
    var bottom = top + object.height;
    return {top: top, left: left, bottom: bottom, right: right};
}

// Source: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function playerCollided(player, enemy) {
    'use strict';
    var collided = false;
    if (player.perimeter && enemy.perimeter) {
        collided = (player.perimeter.left < enemy.perimeter.right &&
            player.perimeter.right > enemy.perimeter.left &&
            player.perimeter.top < enemy.perimeter.bottom &&
            player.perimeter.bottom > enemy.perimeter.top);
    }
    return collided;
}

// Enemies our player must avoid
var Enemy = function () {
    'use strict';
    // The image/sprite for our enemies, this uses
    // a helper to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.width = 99;
    this.height = 66;
    this.reset();
};

// Place player at starting point
Enemy.prototype.reset = function () {
    'use strict';
    this.speed = randomInteger(100, 200);
    this.x = -100 * randomInteger(1, 3);
    this.y = randomInteger(1, 3) * 80 - 15; // 65, 145, 215
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    'use strict';
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    this.y += randomInteger(-1, 1) / 2;
    this.perimeter = objectPerimeter(this);
    // Has the enemy walked off the right side?
    if (this.x > canvas.perimeter.right + canvas.perimeter.colSize) {
        this.reset();
    }
    if (playerCollided(player, this)) {
        player.score--;
        player.lives--;
        player.reset();
    } 
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    'use strict';
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {
    'use strict';
    // The image/sprite for our player, this uses a helper to easily load images
    this.sprite = 'images/char-boy.png';
    this.width = 70;
    this.height = 73;
    this.score = 0;
    this.lives = 3;
    this.reset();
};

// Place player at starting point
Player.prototype.reset = function () {
    'use strict';
    this.x = 202;
    this.y = 402;
};

// Update the player's position
Player.prototype.update = function () {
    'use strict';
    // Has the player reached the water?
    if (this.y < canvas.perimeter.top) {
        this.score++;
        this.reset();
    }
    this.perimeter = objectPerimeter(this);
};

// Draw the player on the screen
Player.prototype.render = function () {
    'use strict';
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Move player in the direction selected
Player.prototype.handleInput = function (key) {
    'use strict';
    switch (key) {
    case 'up':
        this.y -= (this.y > canvas.perimeter.top) ? canvas.perimeter.rowSize : 0;
        break;
    case 'left':
        this.x -= (this.x > canvas.perimeter.left) ? canvas.perimeter.colSize : 0;
        break;
    case 'down':
        this.y += (this.y < canvas.perimeter.bottom) ? canvas.perimeter.rowSize : 0;
        break;
    case 'right':
        this.x += (this.x < canvas.perimeter.right) ? canvas.perimeter.colSize : 0;
        break;
    }
};

// Draw the player on the screen, required method for game
Player.prototype.render = function () {
    'use strict';
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()],
    player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    'use strict';
    var allowedKeys = {
        37 : 'left',
        38 : 'up',
        39 : 'right',
        40 : 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
