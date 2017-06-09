# Winston
Winston is a chess engine and user interface written in JavaScript
## Build
You'll need node.js to run Winston on your machine.

To install all dependencies: `npm install`

To build an un-minimized bundle: `npm run build-dev`

To build a production-ready minimized bundle: `npm run build-prod`

To run the test suite: `npm test`

## Code layout
The Winston root directory contains the following subdirectories:
* `src`: This is where the source code lives
* `bin`: This holds production code including html, css and the bundled JavaScript application
* `test`: This contains the suite of tests (written using Jest)
## `src` directory layout
The `src` directory contains the following subdirectories:
* `Bitboards`: This contains a [Bitboard](https://chessprogramming.wikispaces.com/Bitboards) class, which represents a 64-bit unsigned integer used for board representation, as well as utility functions for creating Bitboards and precomputed bitboards for some useful Board configurations/patterns.
* `Move`: This directory contains a [Move](http://chessprogramming.wikispaces.com/Encoding+Moves) class that stores all necessary information about a move in 16 bits.
* `Position`: This directory contains (you guessed it) a `Position` class. This is by far the largest and most important file in the engine, as it implements all of the board representation and move generation logic.
* `AI`: Here live the brains of the operation. Winston uses a very simple implementation of the [minimax](https://en.wikipedia.org/wiki/Minimax) algorithm with [alpha-beta pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning). The engine uses the [simplified evaluation function](https://chessprogramming.wikispaces.com/Simplified+evaluation+function) to evaluate board positions. It also implements a [quiescence search](https://en.wikipedia.org/wiki/Quiescence_search) to mitigate the [horizon effect](https://en.wikipedia.org/wiki/Horizon_effect).
* `UI`: The user interface, written using jQuery
* `Constants`: Basically header files/namespaces for holding constants.
* `gameUtils`: Some utility functions, mostly for converting among different square representations (e.g., algebraic, index into 64-element array, rank & file)

## Limitations/To-do:
* More testing, especially for AI
* Implement hashing, especially for three-fold repetition draw detection, and transposition tables
* Opening/end-game book
* Iterative deepening
* History and Killer Move heuristics