"use strict";

const {zeroBB, oneBB, lightBB, darkBB, fileBBs, rankBBs,
	   diagBBs, antiDiagBBs} = require('../Utils/BButils');

module.exports = {
	ZERO: zeroBB(),
	ONE: oneBB(),
	LIGHT_SQUARES: lightBB(),
	DARK_SQUARES: darkBB(),
	FILES: fileBBs(),
	RANKS: rankBBs(),
	DIAGONALS: diagBBs(),
	ANTIDIAGONALS: antiDiagBBs()
};