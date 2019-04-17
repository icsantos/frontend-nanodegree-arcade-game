# Classic Arcade Game Clone

Udacity Front-End Web Developer Nanodegree Project 3

## Project overview

The objective is to practice object-oriented JavaScript programming by recreating the classic arcade game **Frogger**.  Given visual assets and a game loop engine, I must create classes for the game pieces, and add properties and methods to govern their interactions.

## Getting started

The starting source code was cloned from <https://github.com/udacity/frontend-nanodegree-arcade-game>.

## Specifications

| Criteria              | Specifications    |
| --------------------- | ----------------- |
| Game Functions        | Game functions correctly and runs error-free (player cannot move off-screen, bugs cross the screen, bug-player collision resets the game, something happens when player reaches the water). To exceed specifications, add such functionality as collectible items on screen, multiple bug types, timed games, etc. |
| Object-Oriented Code  | Game objects (player and bugs) are implemented using JavaScripts's object-oriented programming features. |
| Code Quality          | Code is formatted with consistent, logical, and easy-to-read formatting as described in [Udacity JavaScript Style Guide](http://udacity.github.io/frontend-nanodegree-styleguide/javascript.html) |
| Comments              | Comments are present and effectively explain longer code procedures. To exceed specifications, comments must be thorough and concise, and code must be self-documenting. |
| Documentation         | A README file is included detailing all steps required to successfully run and play the application |

## Steps taken

- Created a GamePiece superclass with methods to -
  - set the x and y coordinates of the game piece
  - render the game piece on the playing field
  - determine the 'hit' zone for use in collision detection
  - detect collision with another game piece
- Created Enemy, Player and Token classes that extend the GamePiece superclass
  - Each Enemy moves from left to right, and on collision with the Player piece resets the game
  - The Player moves left, right, up or down; when it reaches the safety zone *above* the water, it earns either banked points or an extra life
  - A Token appears at random times and slowly fades away; the Player banks points when it 'collides' with a token
- Passed the source code through JSHint and reformatted per the Udacity JavaScript Style Guide
- Added JSDoc comments to the source code

## Results

Click [here](http://icsantos.github.io/frontend-nanodegree-arcade-game/js/out/) to see the JSDoc output.

Click [here](http://icsantos.github.io/frontend-nanodegree-arcade-game/) to play the game.

The game starts automatically.  Press F5 to start a new game.

### Rules of the game

- Use arrow keys to move left, right, up, down
- Score points when you reach the safety zone
  - Reach the safety zone to score 1 point
  - Grab a blue gem to bank 2 points
  - Grab a green gem to bank 4 points
  - Grab an orange gem to bank 8 points
  - Grab a key to bank 16 points
  - Grab a star to bank 32 points
  - You must reach the safety zone to cash in your banked points
- Win or lose hearts on the way to safety
  - Win a heart when you pick up a heart (Time Lords have 2 but you can have up to 5)
  - Lose a heart (and banked points) when you hit a bug (or a bug hits you)
  - The ladybags are deadly too
  - Game ends when you're heartless
