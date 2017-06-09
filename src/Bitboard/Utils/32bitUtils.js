module.exports = {U32, popcnt32, popLSB32, getLSB32};

// Numbers are represented in JavaScript as 64-bit floating point by default. This coerces them
// to unsigned 32-bit integers
function U32(v) {
	return v >>> 0;
}

// Operations on 32-bit integers
function popcnt32(v) {
	v = U32(v);
	v -= (v >>> 1) & 0x55555555;
	v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
	return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
};

function popLSB32(v) {
	v = U32(v);
	return U32(v & (v - 1));
};

function getLSB32(v) {
	v = U32(v);
	return popcnt32((v & -v) - 1);
};