"use strict";

const Constants = require('../Constants');

module.exports = {
	material, evalMaterial, pieceSqVal, evalLocations, evaluate, orderMoves
};

function material(chessPosition, color) {
	let total = 0;
	for (let p = Constants.Pieces.PAWN; p < Constants.Pieces.KING; p++) {
		total += chessPosition.pieceColorBB(p, color).popcnt() * Constants.PIECE_VALS[p];
	}
	if (chessPosition.pieceColorBB(Constants.Pieces.BISHOP, color).popcnt() > 1) {
		total += Constants.BISHOP_PAIR;
	}
	return total;
};

function evalMaterial(chessPosition) {
	return material(chessPosition, Constants.Colors.WHITE) - material(chessPosition, Constants.Colors.BLACK);
};

function pieceSqVal(chessPosition, color) {
	let total = 0;
	for (let p = Constants.Pieces.PAWN; p <= Constants.Pieces.KING; p++) {
		let pieces = chessPosition.pieceColorBB(p, color).copy();
		while (!pieces.empty()) {
			let index = pieces.popRetLSB();
			total += Constants.PST[p][color? index: (56 ^ index)];
		}
	}
	return total;
};

function evalLocations(chessPosition) {
	return pieceSqVal(chessPosition, Constants.Colors.WHITE) - pieceSqVal(chessPosition, Constants.Colors.BLACK);
};

function evaluate(chessPosition) {
	return evalMaterial(chessPosition) + evalLocations(chessPosition);
};

function rankMove(move) {
	let total = move.isCapt()? ((1 + move.captPiece()) / (1 + move.piece())): 0;
	total = total * 6 + move.piece();
	total = total * 16 + move.type();
	total = total * 64 + move.to();
	total = total * 64 + move.from();
	return total;
}

function orderMoves(moves) {
	moves.sort((a, b) => rankMove(b) - rankMove(a));
	return moves;
}