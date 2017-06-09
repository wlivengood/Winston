"use strict";

const Constants = require('../Constants');
const Move = require('../Move');
const {Bitboard, Boards, BButils} = require('../Bitboard');
const {idxToRank, idxToFile, rfToIdx, isLight, rfToAlg, algToIdx,
	idxToAlg, pieceChar, otherColor} = require('../gameUtils');
const {casIdx, casRkSq} = require('./utils');

/* This is the main board representation/move generation class. */

module.exports = class Position {

	constructor() {
		// Bitboards for each piece type as well as all white and all black pieces
		this.bitboards = [
			Boards.RANKS[1].copy().OR(Boards.RANKS[6]), // pawns
			BButils.idxBB(1).OR(BButils.idxBB(6)).OR(BButils.idxBB(57)).OR(BButils.idxBB(62)), // knights
			BButils.idxBB(2).OR(BButils.idxBB(5)).OR(BButils.idxBB(58)).OR(BButils.idxBB(61)), // bishops
			BButils.idxBB(0).OR(BButils.idxBB(7)).OR(BButils.idxBB(56)).OR(BButils.idxBB(63)), // rooks
			BButils.idxBB(3).OR(BButils.idxBB(59)), // queens
			BButils.idxBB(4).OR(BButils.idxBB(60)), // kings
			Boards.RANKS[0].copy().OR(Boards.RANKS[1]), // whites
			Boards.RANKS[6].copy().OR(Boards.RANKS[7]) // blacks
		];

		this.turn = Constants.Colors.WHITE;

		/* 
		* Bit 1: white king-side permission
		* Bit 2: black king-side permission
		* Bit 3: white queen-side permission
		* Bit 4: black queen-side permission
		*/
		this.cas = 0xF;

		// Index of the en passant square
		this.enPas = -1;

		// Counter to keep track of violation of 50 move rule
		this.halfMoves = 0;

		// Holds the piece type at each square
		this.pieceList = [];

		// Every move made
		this.moves = [];

		// Holds the half-move counter, en passant square and castling rights for
		// making and unmaking moves
		this.hist = [];

		// Initialize piece list using bitboards
		for (let idx = 0; idx < 64; idx++) this.pieceList[idx] = this.getPieceFromBB(idx);
	}

	/*
	* BITBOARD METHODS *
	*/

	// Return bitboard of all pieces of given color
	colorBB(color) {
		return this.bitboards[Constants.WHITES + color];
	}

	// Return bitboard of all pieces of given type
	pieceBB(piece) {
		return this.bitboards[piece];
	}

	// Return bitboard of all pieces of given type and color
	pieceColorBB(piece, color) {
		return this.bitboards[piece].copy().AND(this.colorBB(color));
	}

	// Return the king's position
	kingPos(color) {
		return this.pieceColorBB(Constants.Pieces.KING, color).LSB();
	}

	// Return bitboard of all occupied squares
	occupiedBB() {
		return this.bitboards[Constants.WHITES].copy().OR(this.bitboards[Constants.BLACKS]);
	}

	// Return bitboard of all empty squares
	emptyBB() {
		return this.occupiedBB().NOT();
	}

	/* 
	* ATTACK STATUS *
	*/

	// Is the current color's king in check?
	inCheck() {
		return this.isAttacked(otherColor(this.turn), this.kingPos(this.turn));
	}

	// Returns a bitboard of squares attacked by pawns
	pawnAttack(color, pawns) {
		let white = (color === Constants.Colors.WHITE);
		let attacks1 = pawns.copy().AND_NOT(Boards.FILES[0]).SHIFT(white? 7: -9);
		let attacks2 = pawns.copy().AND_NOT(Boards.FILES[Constants.NUM_FILES - 1]).SHIFT(white? 9: -7);
		return attacks1.OR(attacks2);
	}

	// Returns a bitboard of squares attacked by sliding pieces
	slidingAttack(fromBB, occupied, NS, EW) {
		let bb = BButils.zeroBB();
		let dir = NS * Constants.NUM_FILES + EW;
		let mask = Boards.SLIDING_MASKS[1 + EW];

		for (fromBB.SHIFT(dir); !fromBB.AND(mask).empty(); fromBB.AND_NOT(occupied).SHIFT(dir)) {
			bb.OR(fromBB);
		}
		return bb;
	}

	// Returns a bitboard of squares attacked by bishops
	bishopAttack(fromBB, occupied) {
		return this.slidingAttack(fromBB.copy(), occupied, 1, 1).OR(
			this.slidingAttack(fromBB.copy(), occupied, 1, -1)).OR(
			this.slidingAttack(fromBB.copy(), occupied, -1, 1)).OR(
			this.slidingAttack(fromBB.copy(), occupied, -1, -1));
	}

	// Returns a bitboard of squares attacked by rooks
	rookAttack(fromBB, occupied) {
		return this.slidingAttack(fromBB.copy(), occupied, 0, 1).OR(
			this.slidingAttack(fromBB.copy(), occupied, 0, -1)).OR(
			this.slidingAttack(fromBB.copy(), occupied, 1, 0)).OR(
			this.slidingAttack(fromBB.copy(), occupied, -1, 0));
	}

	// Is the piece, if any, specified by color and index under attack?
	isAttacked(color, index) {
		let pawns = this.pieceColorBB(Constants.Pieces.PAWN, color);
		if (this.pawnAttack(color, pawns).isOne(index)) return true;

		let knights = this.pieceColorBB(Constants.Pieces.KNIGHT, color);
		if (!Boards.KNIGHT_MOVEMENTS[index].copy().AND(knights).empty()) return true;

		let king = this.pieceColorBB(Constants.Pieces.KING, color);
		if (!Boards.KING_MOVEMENTS[index].copy().AND(king).empty()) return true;

		let occupied = this.occupiedBB();
		let queens = this.pieceColorBB(Constants.Pieces.QUEEN, color);

		let bq = this.pieceColorBB(Constants.Pieces.BISHOP, color).copy().OR(queens);
		if (this.bishopAttack(bq, occupied).isOne(index)) return true;

		let rq = this.pieceColorBB(Constants.Pieces.ROOK, color).copy().OR(queens);
		if (this.rookAttack(rq, occupied).isOne(index)) return true;

		return false;
	}

	/* CASTLING */

	hasCasRight(color, kingSide) {
		return 0 !== (this.cas & (1 << casIdx(color, kingSide)));
	}

	clearCasRight(color, kingSide) {
		this.cas &= ~(1 << casIdx(color, kingSide));
	}

	// Can the given color castle on the given side?
	canCastle(color, kingSide) {
		if (!this.hasCasRight(color, kingSide)) return false;

		let direction = kingSide ? 1 : -1;
		let kPos = (color === Constants.Colors.WHITE) ? 4 : 60;
		let occupied = this.occupiedBB();

		if (occupied.isOne(kPos + direction) || occupied.isOne(kPos + 2 * direction)) return false;
		if (!kingSide && occupied.isOne(kPos + 3 * direction)) return false;
		if (!this.isCasLegal(color, kingSide)) return false;

		return true;
	}

	// Does the king move through check to castle?
	isCasLegal(color, kingSide) {
		let other = otherColor(color);
		let direction = kingSide ? 1 : -1;
		let kPos = (color === Constants.Colors.WHITE)? 4 :60;

		return !this.isAttacked(other, kPos) && !this.isAttacked(other, kPos + direction) && !this.isAttacked(other, kPos + 2 * direction);
	}

	/* GAME STATUS */

	// Note: Does not check for threefold repetition. Only checks for 50-move rule and
	// insufficient material draws, and always accepts draws
	isDraw() {

		if (this.halfMoves >= 100) return true;
		if (!this.pieceBB(Constants.Pieces.PAWN).empty()) return false;
		if (!this.pieceBB(Constants.Pieces.ROOK).empty()) return false;
		if (!this.pieceBB(Constants.Pieces.QUEEN).empty()) return false;

		let whiteCount = this.colorBB(Constants.Colors.WHITE).popcnt();
		let blackCount = this.colorBB(Constants.Colors.BLACK).popcnt();

		if (whiteCount + blackCount < 4) return true;
		if (!this.pieceBB(Constants.Pieces.KNIGHT).empty()) return false;

		let bishops = this.pieceBB(Constants.Pieces.BISHOP);
		if (bishops.copy().AND(Boards.LIGHT_SQUARES).equals(bishops) || bishops.copy().AND(Boards.DARK_SQUARES).equals(bishops)) 
			return true;

		return false;
	}

	status() {
		if (!this.availableMoves().length) return this.inCheck()? Constants.Status.CHECKMATE: Constants.Status.DRAW;
		if (this.isDraw()) return Constants.Status.DRAW;
		return Constants.Status.NORMAL;
	}

	/* 
	* MOVE GENERATION *
	*/

	// Returns all available moves. pseudoLegal boolean indicates whether to
	// filter moves by whether they put the king in check. captOnly boolean
	// indicates whether to only check capture moves
	availableMoves(pseudoLegal, captOnly) {
		let moves = this.getMoves(!!captOnly);
		return pseudoLegal? moves: moves.filter(this.isLegalMove, this);
	}

	// Does move put the king in check?
	isLegalMove(move) {
		this.update(move);
		let inCheck = this.inCheck();
		this.revert(move);
		return !inCheck;
	}

	// Returns pseudolegal moves (i.e., moves might leave king in check). captOnly boolean
	// indicates whether to only check capture moves
	getMoves(captOnly) {
		let moves = [];
		let turn = this.turn;
		let turnBB = this.colorBB(turn);
		let otherBB = this.colorBB(otherColor(turn));
		let occupied = this.occupiedBB();
		let pos = this;

		const pawnMoves = (toBB, movement, kind) => {
			while (!toBB.empty()) {
				let index = toBB.popRetLSB();
				moves.push(new Move(index - movement, index, kind, Constants.Pieces.PAWN, pos.getPieceFromPL(index)));
			}
		}

		const pawnPromos = (toBB, movement, capture) => {
			pawnMoves(toBB.copy(), movement, capture? Constants.MoveTypes.QUEEN_PROMOTION_CAPTURE: Constants.MoveTypes.QUEEN_PROMOTION);
			pawnMoves(toBB.copy(), movement, capture? Constants.MoveTypes.ROOK_PROMOTION_CAPTURE: Constants.MoveTypes.ROOK_PROMOTION);
			pawnMoves(toBB.copy(), movement, capture? Constants.MoveTypes.BISHOP_PROMOTION_CAPTURE: Constants.MoveTypes.BISHOP_PROMOTION);
			pawnMoves(toBB.copy(), movement, capture? Constants.MoveTypes.KNIGHT_PROMOTION_CAPTURE: Constants.MoveTypes.KNIGHT_PROMOTION);
		}

		const otherMoves = (from, toBB, piece) => {
			while (!toBB.empty()) {
				let to = toBB.popRetLSB();
				if (turnBB.isZero(to)) {
					moves.push(new Move(from, to, otherBB.isOne(to)? Constants.MoveTypes.CAPTURE: Constants.MoveTypes.QUIET, piece, pos.getPieceFromPL(to)));
				}
			}
		}

		let EW = 1 - 2 * turn;
		let NS = Constants.NUM_FILES * EW;
		let pawns = this.pieceColorBB(Constants.Pieces.PAWN, turn);
		let lastRow = Boards.RANKS[turn? 0: Constants.NUM_RANKS - 1];

		if (!captOnly) {
			let DPP = pawns.copy().AND(Boards.RANKS[turn? 6: 1]).SHIFT(2 * NS).AND_NOT(occupied).AND_NOT(occupied.copy().SHIFT(NS));
			pawnMoves(DPP, 2 * NS, Constants.MoveTypes.DOUBLE_PAWN_PUSH);

			let SPP = pawns.copy().SHIFT(NS).AND_NOT(occupied);
			pawnMoves(SPP.copy().AND_NOT(lastRow), NS, Constants.MoveTypes.QUIET);
			pawnPromos(SPP.copy().AND(lastRow), NS, false);
		}

		let leftFile = Boards.FILES[turn? Constants.NUM_FILES - 1: 0];
		let leftCapt = NS - EW;
		let pawnLeftCapt = pawns.copy().AND_NOT(leftFile).SHIFT(leftCapt).AND(otherBB);
		pawnMoves(pawnLeftCapt.copy().AND_NOT(lastRow), leftCapt, Constants.MoveTypes.CAPTURE);
		pawnPromos(pawnLeftCapt.copy().AND(lastRow), leftCapt, true);

		let rightFile = Boards.FILES[turn? 0: Constants.NUM_FILES - 1];
		let rightCapt = NS + EW;
		let pawnRightCapt = pawns.copy().AND_NOT(rightFile).SHIFT(rightCapt).AND(otherBB);
		pawnMoves(pawnRightCapt.copy().AND_NOT(lastRow), rightCapt, Constants.MoveTypes.CAPTURE);
		pawnPromos(pawnRightCapt.copy().AND(lastRow), rightCapt, true);

		if (this.enPas >= 0) {
			let leftEnPas = BButils.idxBB(this.enPas + EW).AND(pawns).AND_NOT(leftFile).SHIFT(leftCapt);
			pawnMoves(leftEnPas, leftCapt, Constants.MoveTypes.EN_PASSANT_CAPTURE);
			let rightEnPas = BButils.idxBB(this.enPas - EW).AND(pawns).AND_NOT(rightFile).SHIFT(rightCapt);
			pawnMoves(rightEnPas, rightCapt, Constants.MoveTypes.EN_PASSANT_CAPTURE);
		}

		let mask = captOnly? otherBB: Boards.ONE;

		let knights = this.pieceColorBB(Constants.Pieces.KNIGHT, turn).copy();
		while (!knights.empty()) {
			let nPos = knights.popRetLSB();
			otherMoves(nPos, Boards.KNIGHT_MOVEMENTS[nPos].copy().AND(mask), Constants.Pieces.KNIGHT);
		}

		let queens = this.pieceColorBB(Constants.Pieces.QUEEN, turn).copy();
		while (!queens.empty()) {
			let qPos = queens.popRetLSB();
			otherMoves(qPos, this.bishopAttack(BButils.idxBB(qPos), occupied).OR(
				this.rookAttack(BButils.idxBB(qPos), occupied)).AND(mask), Constants.Pieces.QUEEN);
		}

		let bishops = this.pieceColorBB(Constants.Pieces.BISHOP, turn).copy();
		while (!bishops.empty()) {
			let bPos = bishops.popRetLSB();
			otherMoves(bPos, this.bishopAttack(BButils.idxBB(bPos), occupied).AND(mask), Constants.Pieces.BISHOP);
		}

		let rooks = this.pieceColorBB(Constants.Pieces.ROOK, turn).copy();
		while (!rooks.empty()) {
			let rPos = rooks.popRetLSB();
			otherMoves(rPos, this.rookAttack(BButils.idxBB(rPos), occupied).AND(mask), Constants.Pieces.ROOK);
		}

		let kPos = this.kingPos(turn);
		otherMoves(kPos, Boards.KING_MOVEMENTS[kPos].copy().AND(mask), Constants.Pieces.KING);

		if (!captOnly) {
			if (this.canCastle(turn, true)) {
				moves.push(new Move(kPos, kPos + 2, Constants.MoveTypes.KING_CASTLE, Constants.Pieces.KING, null));
			}
			if (this.canCastle(turn, false)) {
				moves.push(new Move(kPos, kPos - 2, Constants.MoveTypes.QUEEN_CASTLE, Constants.Pieces.KING, null));
			}
		}

		return moves;
	}

	/* MOVE EXECUTION */

	capture(piece, color, index) {
		this.pieceBB(piece).clearBit(index);
		this.colorBB(color).clearBit(index);
		this.pieceList[index] = null;
	}

	uncapture(piece, color, index) {
		this.pieceBB(piece).setBit(index);
		this.colorBB(color).setBit(index);
		this.pieceList[index] = piece;
	}

	move(piece, color, from, to) {
		let fromToBB = BButils.idxBB(from).OR(BButils.idxBB(to));
		this.pieceBB(piece).XOR(fromToBB);
		this.colorBB(color).XOR(fromToBB);
		this.pieceList[from] = null;
		this.pieceList[to] = piece;
	}

	casRook(color, kingSide) {
		let from = casRkSq(color, kingSide);
		let to = from + (kingSide ? -2 : 3);
		this.move(Constants.Pieces.ROOK, color, from, to);
	}

	unCasRook(color, kingSide) {
		let to = casRkSq(color, kingSide);
		let from = to + (kingSide ? -2 : 3);
		this.move(Constants.Pieces.ROOK, color, from, to);
	}

	promote(pieceOld, pieceNew, color, index) {
		this.pieceBB(pieceOld).clearBit(index);
		this.pieceBB(pieceNew).setBit(index);
		this.pieceList[index] = pieceNew;
	}

	update(move) {
		if (move.isCapt()) this.capture(move.captPiece(), otherColor(this.turn), move.captSq());
		if (move.isCas()) this.casRook(this.turn, move.type() === Constants.MoveTypes.KING_CASTLE);
		this.move(move.piece(), this.turn, move.from(), move.to());
		if (move.isPromo()) 
			this.promote(Constants.Pieces.PAWN, move.promoPiece(), this.turn, move.to());
	}

	revert(move) {
		if (move.isPromo()) this.promote(move.promoPiece(), Constants.Pieces.PAWN, this.turn, move.to());
		this.move(move.piece(), this.turn, move.to(), move.from());
		if (move.isCas()) this.unCasRook(this.turn, move.type() === Constants.MoveTypes.KING_CASTLE);
		if (move.isCapt()) this.uncapture(move.captPiece(), otherColor(this.turn), move.captSq());
	}

	makeMove(move) {
		this.update(move);
		if (this.inCheck()) {
			this.revert(move);
			return false;
		}
		this.moves.push(move);
		this.hist.push(this.enPas);
		this.hist.push(this.cas);
		this.hist.push(this.halfMoves);

		if (move.type() === Constants.MoveTypes.DOUBLE_PAWN_PUSH) this.enPas = move.to();
		else this.enPas = -1;

		let turn = this.turn;

		if (move.piece() === Constants.Pieces.KING) {
			this.clearCasRight(turn, true);
			this.clearCasRight(turn, false);
		} 
		else if (move.piece() === Constants.Pieces.ROOK) {
			if (move.from() === casRkSq(turn, true)) this.clearCasRight(turn, true);
			else if (move.from() === casRkSq(turn, false)) this.clearCasRight(turn, false);
		}

		let other = otherColor(turn);

		if (move.captPiece() === Constants.Pieces.ROOK) {
			if (move.captSq() === casRkSq(other, true)) this.clearCasRight(other, true);
			else if (move.captSq() === casRkSq(other, false)) this.clearCasRight(other, false);
		}

		if (move.isCapt() || move.piece() === Constants.Pieces.PAWN) this.halfMoves = 0;
		else this.halfMoves++;
		this.turn = other;
		return true;
	}

	unmakeMove() {
		if (!this.moves.length > 0) return null;
		let move = this.moves.pop();
		this.turn = otherColor(this.turn);
		this.revert(move);
		this.halfMoves = this.hist.pop();
		this.cas = this.hist.pop();
		this.enPas = this.hist.pop();
		return move;
	}

	/* PIECE RETRIEVAL */

	getPieceFromPL(index) {
		return this.pieceList[index];
	}

	getPieceFromBB(index) {
		for (let piece = Constants.Pieces.PAWN; piece <= Constants.Pieces.KING; piece++) {
			if (this.pieceBB(piece).isOne(index)) {
				return piece;
			}
		}
		return null;
	}

};
