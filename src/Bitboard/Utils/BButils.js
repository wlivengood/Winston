const Bitboard = require('../Bitboard');

module.exports = {
	makeBB, zeroBB, oneBB, lightBB, darkBB, fileBB, fileBBs,
	rankBB, rankBBs, idxBB, diagBB, diagBBs, antiDiagBB, antiDiagBBs
};

function makeBB(low, high) {
	return new Bitboard(low, high);
};

function zeroBB() {
	return makeBB(0, 0);
};

function oneBB() {
	return makeBB(0xFFFFFFFF, 0xFFFFFFFF);
};

function lightBB() {
	return makeBB(0x55AA55AA, 0x55AA55AA);
};

function darkBB() {
	return makeBB(0xAA55AA55, 0xAA55AA55);
};

function fileBB(file) {
	return makeBB(0x01010101, 0x01010101).SHL(file);
};

function fileBBs() {
	let b = [];
	for (let i = 0; i < 8; ++i) b.push(fileBB(i));
	return b;
};

function rankBB(rank) {
	return makeBB(0xFF, 0).SHL(rank * 8);
};

function rankBBs() {
	let b = [];
	for (let i = 0; i < 8; ++i) b.push(rankBB(i));
	return b;
};

function idxBB(index) {
	return zeroBB().setBit(index);
};

function diagBB(diagonal) {
	return makeBB(0x10204080, 0x01020408).AND(oneBB().SHIFT(diagonal * 8)).SHIFT(diagonal);
};

function diagBBs() {
	let b = [];
	for (let i = -7; i < 8; ++i) b.push(diagBB(i));
	return b;
};

function antiDiagBB(antidiagonal) {
	return makeBB(0x08040201, 0x80402010).AND(oneBB().SHIFT(-antidiagonal * 8)).SHIFT(antidiagonal);
};

function antiDiagBBs() {
	let b = [];
	for (let i = -7; i < 8; ++i) b.push(antiDiagBB(i));
	return b;
};