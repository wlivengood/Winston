const Move = require('../src/Move');
const Constants = require('../src/Constants');

describe('Move', () => {
	let move = new Move(24, 33, Constants.MoveTypes.CAPTURE, Constants.Pieces.BISHOP, Constants.Pieces.KNIGHT);
	test('It returns the correct "from" value', () => {
		expect(move.from()).toEqual(24);
	});
	test('It returns the correct "to" value', () => {
		expect(move.to()).toEqual(33);
	});
	test('It returns the correct "type" value', () => {
		expect(move.type()).toEqual(Constants.MoveTypes.CAPTURE);
	});
	test('It returns the correct "piece" value', () => {
		expect(move.piece()).toEqual(Constants.Pieces.BISHOP);
	});
	test('It returns whether or not it is a capture', () => {
		expect(move.isCapt()).toEqual(true);
	});
	test('It returns the correct captured piece', () => {
		expect(move.captPiece()).toEqual(Constants.Pieces.KNIGHT);
	});
	test('It returns whether or not it is a promotion', () => {
		expect(move.isPromo()).toEqual(false);
	});
	test('It returns whether or not it is a castle', () => {
		expect(move.isCas()).toEqual(false);
	});
	test('it returns the correct capture square', () => {
		expect(move.captSq()).toEqual(33);
	});
});