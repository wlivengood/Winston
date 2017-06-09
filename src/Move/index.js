"use strict";

const Constants = require('../Constants');
const {
	idxToRank, getFile, isInsideBoard, getIndex, isLight, getAlgebraic, algToIdx,
	idxToAlg, pieceChar, otherColor
} = require('../gameUtils');

/* See http://chessprogramming.wikispaces.com/Encoding+Moves */

module.exports = class Move {

	constructor(from, to, type, piece, captPiece) {
		captPiece = captPiece || 0;
		this.val = (to & 0x3F) | ((from & 0x3F) << 6) | ((type & 0xF) << 12) | ((piece & 0x7) << 16) | ((captPiece & 0x7) << 19);
	}

	to() {
		return this.val & 0x3F;
	}

	from() {
		return (this.val >>> 6) & 0x3F;
	}

	type() {
		return (this.val >>> 12) & 0xF;
	}

	piece() {
		return (this.val >>> 16) & 0x7;
	}

	isCapt() {
		return !!(this.type() & 4);
	}

	captPiece() {
		return (this.val >>> 19) & 0x7;
	}

	isPromo() {
		return !!(this.type() & 8);
	}

	isCas() {
		return this.type() === Constants.MoveTypes.KING_CASTLE || this.type() === Constants.MoveTypes.QUEEN_CASTLE;
	}

	promoPiece() {
		if (this.isPromo()) return Constants.Pieces.KNIGHT + (this.type() & 3);
		return Constants.Pieces.PAWN;
	}

	captSq() {
		if (this.type() !== Constants.MoveTypes.EN_PASSANT_CAPTURE) return this.to();
		return this.to() + ((this.from() < this.to())? -Constants.NUM_FILES: Constants.NUM_FILES);
	}
	
};