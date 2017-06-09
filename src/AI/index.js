"use strict";

const Constants = require('../Constants');
const {material, evalMaterial, pieceSqVal, 
	evalLocations, evaluate, orderMoves} = require('./utils');

module.exports = class AI {

	search(pos) {

		function qSearch(pos, alpha, beta) {
			if (pos.isDraw()) return 0;

			let staticVal = evaluate(pos);
			let white = (pos.turn === Constants.Colors.WHITE);

			if (white) {
				if (staticVal >= beta) return beta;
				alpha = (staticVal > alpha)? staticVal: alpha;
			} 
			else {
				if (staticVal <= alpha) return alpha;
				beta = (staticVal < beta)? staticVal: beta;
			}

			let moves = orderMoves(pos.availableMoves(true, !pos.inCheck()));

			for (let move of moves) {
				if (pos.makeMove(move)) {
					let val = qSearch(pos, alpha, beta);
					pos.unmakeMove();
					if (white) {
						if (val >= beta) return beta;
						alpha = (val > alpha)? val: alpha;
					} 
					else {
						if (val <= alpha) return alpha;
						beta = (val < beta)? val: beta;
					}
				}
			}
			return white? alpha: beta;
		}

		function alphaBeta(pos, d, alpha, beta) {
			if (d < 1) return qSearch(pos, alpha, beta);

			let moves = orderMoves(pos.availableMoves(true, false));
			let white = (pos.turn === Constants.Colors.WHITE);
			let legal = false;

			for (let move of moves) {
				if (pos.makeMove(move)) {
					legal = true;
					let val = alphaBeta(pos, d - 1, alpha, beta);
					pos.unmakeMove();
					if (white) alpha = (val > alpha)? val : alpha; 
					else beta = (val < beta)? val: beta;
					if (beta <= alpha) break;
				}
			}
			if (!legal) {
				if (!pos.inCheck()) return 0;
				let checkMate = Constants.PIECE_VALS[Constants.Pieces.KING];
				return white? -checkMate: checkMate;
			}
			if (pos.isDraw()) return 0;
			return white? alpha: beta;
		}
		let alpha = -Infinity;
		let beta = Infinity;
		let best = null;
		let moves = orderMoves(pos.availableMoves(true));
		for (let move of moves) {
			if (pos.makeMove(move)) {
				let val = alphaBeta(pos, 3, alpha, beta);
				pos.unmakeMove();
				if (pos.turn === Constants.Colors.WHITE) {
					if (val > alpha) {
						alpha = val;
						best = move;
					}
				} 
				else {
					if (val < beta) {
						beta = val;
						best = move;
					}
				}
			}
		}
		return best;
	};
}
