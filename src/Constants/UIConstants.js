"use strict";

let UI_CONSTANTS = {};

UI_CONSTANTS.ID = "#board";

UI_CONSTANTS.TABLE = UI_CONSTANTS.ID + " table";

UI_CONSTANTS.SQUARE = UI_CONSTANTS.ID + " table tr td";

UI_CONSTANTS.PIECE = UI_CONSTANTS.SQUARE + " div";

UI_CONSTANTS.PIECE_SQ = UI_CONSTANTS.SQUARE + ", " + UI_CONSTANTS.PIECE;

module.exports = {
	UI: UI_CONSTANTS
};