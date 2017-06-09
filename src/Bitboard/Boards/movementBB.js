"use strict";

const positionalBB = require('./positionalBB');
const {zeroBB} = require('../Utils/BButils');

/* Bitboards to represent knight and king movements */

module.exports = {
	KNIGHT_MOVEMENTS: knightBBs(),
	KING_MOVEMENTS: kingBBs()
};

function knightBB(index) {
	let b = zeroBB().setBit(index);
	let l1 = b.copy().SHR(1).AND_NOT(positionalBB.FILES[7]);
	let l2 = b.copy().SHR(2).AND_NOT(positionalBB.FILES[7]).AND_NOT(positionalBB.FILES[6]);
	let r1 = b.copy().SHL(1).AND_NOT(positionalBB.FILES[0]);
	let r2 = b.copy().SHL(2).AND_NOT(positionalBB.FILES[0]).AND_NOT(positionalBB.FILES[1]);
	let v1 = l2.OR(r2);
	let v2 = l1.OR(r1);
	return v1.copy().SHL(8).OR(v1.SHR(8)).OR(v2.copy().SHL(16)).OR(v2.SHR(16));
};

function knightBBs() {
	let b = [];
	for (let i = 0; i < 64; ++i) b.push(knightBB(i));
	return b;
};

function kingBB(index) {
	let b = zeroBB().setBit(index);
	let c = b.copy().SHR(1).AND_NOT(positionalBB.FILES[7]).OR(b.copy().SHL(1).AND_NOT(positionalBB.FILES[0]));
	let u = b.copy().OR(c).SHR(8);
	let d = b.copy().OR(c).SHL(8);
	return c.OR(u).OR(d);
};

function kingBBs() {
	let b = [];
	for (let i = 0; i < 64; ++i) b.push(kingBB(i));
	return b;
};