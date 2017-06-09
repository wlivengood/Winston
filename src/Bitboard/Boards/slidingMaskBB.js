"use strict";

const Constants = require('../../Constants');
const {fileBB, oneBB} = require('../Utils/BButils');

// Bitboards to prevent sliding piece wrap-around
module.exports = {
	SLIDING_MASKS: [fileBB(Constants.NUM_FILES - 1).NOT(), oneBB(), fileBB(0).NOT()]
};