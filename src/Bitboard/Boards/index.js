"use strict";

/*
* Precomputed bitboards *
*/

const positionalBB = require('./positionalBB');
const movementBB = require('./movementBB');
const slidingMaskBB = require('./slidingMaskBB');
module.exports = Object.assign({}, positionalBB, movementBB, slidingMaskBB);