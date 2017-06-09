const {Bitboard, Boards, BButils} = require('../src/Bitboard');
const {
	makeBB, zeroBB, oneBB, lightBB, darkBB, fileBB, fileBBs,
	rankBB, rankBBs, idxBB, diagBB, diagBBs, antiDiagBB, antiDiagBBs
} = BButils;

describe('Bitboard', () => {
	test('ZERO board has no set bits', () => {
		expect(Boards.ZERO.popcnt()).toEqual(0);
	});
	test('ONE board has 64 set bits', () => {
		expect(Boards.ONE.popcnt()).toBe(64);
	});
	test('idxBB returns board with only bit at idx set', () => {
		expect(idxBB(42).isOne(42)).toEqual(true);
		expect(idxBB(42).isOne(43)).toEqual(false);
	});
	test('fileBB returns a board with all bits in a file set', () => {
		expect(fileBB(2).popcnt()).toEqual(8);
		for (let i = 0; i < 64; i++) {
			if ((i - 2) % 8 === 0) expect(fileBB(2).isOne(i)).toEqual(true);
			else expect(fileBB(2).isOne(i)).toEqual(false);
		}
	});
	test('rankBB returns a board with all bits in a rank set', () => {
		expect(rankBB(5).popcnt()).toEqual(8);
		for (let i = 0; i < 64; i++) {
			if (i >= 40 && i < 48) expect(rankBB(5).isOne(i)).toEqual(true);
			else expect(rankBB(5).isOne(i)).toEqual(false);
		}
	});
	test('lightBB and darkBB', () => {
		expect(lightBB().popcnt()).toEqual(32);
		expect(darkBB().popcnt()).toEqual(32);
		expect(lightBB().XOR(darkBB()).popcnt()).toEqual(64);
	});
});