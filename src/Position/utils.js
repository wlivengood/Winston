"use strict";

const Constants = require('../Constants');

module.exports = {perft, casIdx, casRkSq};

// Returns the number of leaf nodes in the game tree at a given depth
function perft(d, pos) {
	if (!d) return 1;
	let total = 0;
	for (let move of pos.availableMoves(true)) {
		if (pos.makeMove(move)) {
			total += perft(d - 1, pos);
			pos.unmakeMove();
		}
	}
	return total;
};

function casIdx(color, kingSide) {
	return color + (kingSide? 0: 2);
};

function casRkSq(color, kingSide) {
	return Constants.CORNERS[casIdx(color, kingSide)];
};