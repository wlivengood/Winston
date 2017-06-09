"use strict";

module.exports = {
	NUM_RANKS: 8,
	NUM_FILES: 8,
	FILE_CHARS: "abcdefgh",
	RANK_CHARS: "12345678",
	PIECE_CHARS: "\u2659\u265F\u2658\u265E\u2657\u265D\u2656\u265C\u2655\u265B\u2654\u265A",
	Pieces: {
		PAWN: 0,
		KNIGHT: 1,
		BISHOP: 2,
		ROOK: 3,
		QUEEN: 4,
		KING: 5
	},
	Colors: {
		WHITE: 0,
		BLACK: 1
	},
	PIECE_NAMES: [ "pawn", "knight", "bishop", "rook", "queen", "king" ],
	ALG_NAMES: " NBRQK"
};