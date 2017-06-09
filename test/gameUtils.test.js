const Constants = require('../src/Constants');
const {idxToRank, idxToFile, rfToIdx, isLight, rfToAlg, algToIdx,
	idxToAlg, pieceChar, otherColor} = require('../src/gameUtils');

describe('Game Utilities',  () => {
	test('idxToRank', () => {
		expect(idxToRank(5)).toEqual(0);
		expect(idxToRank(42)).toEqual(5);
	});
	test('idxToFile', () => {
		expect(idxToFile(5)).toEqual(5);
		expect(idxToFile(42)).toEqual(2);
	});
	test('rfToIdx', () => {
		expect(rfToIdx(0, 0)).toEqual(0);
		expect(rfToIdx(7,7)).toEqual(63);
		expect(rfToIdx(4, 3)).toEqual(35);
	});
	test('isLight', () => {
		let startsWhite = false;
		let i = 0;
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (startsWhite) expect(isLight(i, j)).toEqual((rfToIdx(i, j) % 2) === 0);
				else expect(isLight(i, j)).toEqual((rfToIdx(i, j) % 2) === 1);
			}
			startsWhite = !startsWhite;
		}
	});
	test('rfToAlg', () => {
		expect(rfToAlg(2, 5)).toEqual('f3');
		expect(rfToAlg(7, 1)).toEqual('b8');
	});
	test('algToIdx', () => {
		expect(algToIdx('f3')).toEqual(rfToIdx(2, 5));
		expect(algToIdx('b8')).toEqual(rfToIdx(7, 1));
	});
	test('idxToAlg', () => {
		expect(idxToAlg(rfToIdx(2, 5))).toEqual('f3');
		expect(idxToAlg(rfToIdx(7, 1))).toEqual('b8');
	});
	test('pieceChar', () => {
		expect(pieceChar(Constants.Pieces.KNIGHT, Constants.Colors.WHITE)).toEqual('\u2658');
		expect(pieceChar(Constants.Pieces.QUEEN, Constants.Colors.BLACK)).toEqual('\u265B');
	});
	test('otherColor', () => {
		let color = Constants.Colors.WHITE;
		expect(otherColor(color)).toEqual(Constants.Colors.BLACK);
	})
})