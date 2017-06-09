"use strict";

const Position = require('../Position');
const AI = require('../AI');
const Constants = require('../Constants');
const {idxToRank, idxToFile, rfToIdx, isLight, rfToAlg, algToIdx,
	idxToAlg, pieceChar, otherColor} = require('../gameUtils');
const {ID, TABLE, SQUARE, PIECE, PIECE_SQ} = Constants.UI;

module.exports = class UI {

	constructor() {
		this.pos = new Position();
		this.ai = new AI();
	}

	createBoard() {
		let table = $("<table>");

		for (let i = 0; i < Constants.NUM_RANKS; i++) {
			let rank = Constants.NUM_RANKS - 1 - i;
			let tr = $("<tr>");
			table.append(tr);

			let cell = '<th class="rank">' + (Constants.NUM_RANKS - i) + "</th>";
			tr.append(cell);

			for (let j = 0; j < Constants.NUM_FILES; j++) {
				let td = $("<td>");
				let color = isLight(rank, j)? "light": "dark";
				td.attr("id", rfToAlg(rank, j));
				td.addClass(color);
				tr.append(td);
			}
		}
		let ranksRow = '<tr><th></th>' + "abcdefgh".split("").map(el => '<th class="file">' + el + "</th>").join("") + "<th></th></tr>";
		table.append(ranksRow);
		$(ID).append(table);
	}

	clearMoving() {
		$(PIECE_SQ).removeClass("from to king-castle queen-castle");
	}

	clearDragging() {
		$(PIECE + ".ui-draggable").draggable("destroy");
		$(SQUARE + ".ui-droppable").droppable("destroy");
	}

	updatePieces() {
		$(PIECE).remove();
		$(SQUARE).removeClass("white black turn last-move " + Constants.PIECE_NAMES.join(" "));

		let whites = this.pos.colorBB(Constants.Colors.WHITE);
		let blacks = this.pos.colorBB(Constants.Colors.BLACK);

		for (let i = 0; i < Constants.NUM_RANKS * Constants.NUM_FILES; ++i) {
			let td = $("#" + idxToAlg(i));
			for (let p = Constants.Pieces.PAWN; p <= Constants.Pieces.KING; p++) {
				if (this.pos.pieceBB(p).isOne(i)) {
					let isTurn = (this.pos.turn === Constants.Colors.WHITE)? whites.isOne(i): blacks.isOne(i);

					let div = $("<div>");
					div.text(pieceChar(p, whites.isOne(i)? Constants.Colors.WHITE: Constants.Colors.BLACK));

					let el = div.add(td);;
					el.addClass(Constants.PIECE_NAMES[p]);
					el.toggleClass("white", whites.isOne(i));
					el.toggleClass("black", blacks.isOne(i));
					el.toggleClass("turn", isTurn);
					td.append(div);

					break;
				}
			}
		}
	}

	updateMoves() {
		let moves = this.pos.availableMoves();

		$(PIECE_SQ).removeClass("can-move");

		for (let move of moves) {
			let td = $("#" + idxToAlg(move.from()));
			let el = td.add(td.children());
			el.addClass("can-move");
		}

		let dragging = false;
		let ui = this;

		$(PIECE + ".can-move").mouseenter(function(event) {
			if (dragging) return;

			let div = $(this);
			let td = div.parent();
			let from = algToIdx("" + td.attr("id"));
			let fromEls = td.add(div);
			fromEls.toggleClass("from", moves.some(move => move.from() === from));

			if (fromEls.hasClass("from")) {
				for (let move of moves) {
					if (move.from() === from) {
						let toEl = $("#" + idxToAlg(move.to()));
						toEl = toEl.add(toEl.children());
						toEl.addClass("to");
						if (move.type() === Constants.MoveTypes.KING_CASTLE) toEl.addClass("king-castle");
						if (move.type() === Constants.MoveTypes.QUEEN_CASTLE) toEl.addClass("queen-castle");
					}
				};

				ui.clearDragging();

				$(SQUARE + ".to").droppable({
					"drop": function() {
						let to = algToIdx("" + $(this).attr("id"));
						let makeMoves = moves.filter(move => move.from() === from && move.to() === to);
						if (makeMoves.length > 0) {
							ui.pos.makeMove(makeMoves[0]);
							ui.updatePos();
						} 
						else {
							ui.clearMoving();
							ui.clearDragging();
						}
					}
				});

				div.draggable({
					"start": () => dragging = true,
					"stop": () => dragging = false,
					"containment": TABLE,
					"zIndex": 10,
					"revert": "invalid"
				});
			}
		}).mouseleave(() => {if (!dragging) ui.clearMoving()});
	}

	aiMove() {
		let ui = this;
		let move = ui.ai.search(ui.pos);
		ui.pos.makeMove(move);
		let from = $("#" + idxToAlg(move.from()));
		let to = $("#" + idxToAlg(move.to()));
		let dx = to.offset().left - from.offset().left;
		let dy = to.offset().top - from.offset().top;
		let piece = from.children("div");
		piece.css({"position": "relative", "top": "0px", "left": "0px" });
		piece.animate({"top": dy + "px", "left": dx + "px"}, () => ui.updatePos());
	}

	updatePos() {
		this.clearMoving();
		this.clearDragging();
		this.updatePieces();
		let status = this.pos.status();
		let turn = this.pos.turn;
		if (status === Constants.Status.NORMAL && turn === Constants.Colors.BLACK) this.aiMove();
		else this.updateMoves();
	}

};
