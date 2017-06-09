const Position = require('../src/Position');
const perft = require('../src/Position/utils').perft;
const Constants = require('../src/Constants');

describe('Position', () => {
	test('The starting position has the correct number of each piece/color', () => {
		let pos = new Position();
		expect(pos.colorBB(Constants.Colors.WHITE).popcnt()).toEqual(16);
		expect(pos.colorBB(Constants.Colors.BLACK).popcnt()).toEqual(16);
		expect(pos.pieceBB(Constants.Pieces.PAWN).popcnt()).toEqual(16);
		expect(pos.pieceBB(Constants.Pieces.ROOK).popcnt()).toEqual(4);
		expect(pos.pieceBB(Constants.Pieces.KNIGHT).popcnt()).toEqual(4);
		expect(pos.pieceBB(Constants.Pieces.BISHOP).popcnt()).toEqual(4);
		expect(pos.pieceBB(Constants.Pieces.QUEEN).popcnt()).toEqual(2);
		expect(pos.pieceBB(Constants.Pieces.KING).popcnt()).toEqual(2);
	});
	describe('perft testing', () => {
		let pos;
		beforeEach(() => pos = new Position());
		test('perft(0)', () => {
			expect(perft(0, pos)).toEqual(1);
		});
		test('perft(1)', () => {
			expect(perft(1, pos)).toEqual(20);
		});
		test('perft(2)', () => {
			expect(perft(2, pos)).toEqual(400);
		});
		test('perft(3)', () => {
			expect(perft(3, pos)).toEqual(8902);
		});
		test('perft(4)', () => {
			expect(perft(4, pos)).toEqual(197281);
		});
		// // Perft(5) runs slow. Took ~16 sec on my machine
		// test('perft(5)', () => {
		// 	expect(perft(5, pos)).toEqual(4865609);
		// });
	})
});