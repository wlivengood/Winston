"use strict";

/* Utility functions - mostly for converting various square representation formats
* (e.g., rank & file, idx, algebraic) */

const Constants = require('../Constants');

module.exports = {
	idxToRank, idxToFile, rfToIdx, isLight, rfToAlg, algToIdx, idxToAlg, pieceChar, otherColor
};

function pieceChar(piece, color) {
	return Constants.PIECE_CHARS.charAt(piece * 2 + color);
}

function otherColor(color) {
	return color ^ 1;
}

function idxToRank(index) {
	return index >>> 3;
}

function idxToFile(index) {
	return index & 7;
}

function rfToIdx(rank, file) {
	return file + rank * Constants.NUM_FILES;
}

function isLight(rank, file) {
	return !!((rank + file) % 2);
}

function rfToAlg(rank, file) {
	return Constants.FILE_CHARS[file] + Constants.RANK_CHARS[rank];
}

function algToIdx(algebraic) {
	let rank = Constants.RANK_CHARS.indexOf(algebraic[1]);
	let file = Constants.FILE_CHARS.indexOf(algebraic[0]);
	return rfToIdx(rank, file);
}

function idxToAlg(index) {
	return rfToAlg(idxToRank(index), idxToFile(index));
}


