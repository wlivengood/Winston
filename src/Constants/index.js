"use strict";

const AIConstants = require('./AIConstants');
const BoardConstants = require('./BoardConstants');
const MoveConstants = require('./MoveConstants');
const PositionConstants = require('./PositionConstants');
const UIConstants = require('./UIConstants');
module.exports = Object.assign({}, AIConstants, BoardConstants, MoveConstants, 
	PositionConstants, UIConstants);