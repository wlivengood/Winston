"use strict";

const {U32, popcnt32, popLSB32, getLSB32} = require('../Utils/32bitUtils');

/*
* Bitboard class: Represents a 64-bit unsigned int, which can represent some boolean-ish
* value for all 64 squares of a chess board. Since JavaScript does not support 64-bit
* unsigned integers, we need a class for that, which is represented using two 32-bit
* unsigned ints.
*/
module.exports = class Bitboard {

	constructor(lower, upper) {
		this.lower = U32(lower);
		this.upper = U32(upper);
	}

	empty() {
		return !this.lower && !this.upper;
	}

	// Checking if bit located at idx is zero or one
	isZero(idx) {
		idx = U32(idx);
		return idx < 32? !(this.lower & (1 << idx)): !(this.upper & (1 << (idx - 32)));
	}

	isOne(idx) {
		return !this.isZero(idx);
	}

	// Setting and clearing bits located at idx
	setBit(idx) {
		idx = U32(idx);
		if (idx < 32) this.lower = U32(this.lower | (1 << idx));
		else this.upper = U32(this.upper | (1 << (idx - 32)));
		return this;
	}

	clearBit(idx) {
		idx = U32(idx);
		if (idx < 32) this.lower = U32(this.lower & ~(1 << idx));
		else this.upper = U32(this.upper & ~(1 << (idx - 32)));
		return this;
	}

	// Count all set bits
	popcnt() {
		return popcnt32(this.lower) + popcnt32(this.upper);
	}

	// Clear the least significant bit
	popLSB() {
		if (this.lower) this.lower = popLSB32(this.lower);
		else this.upper = popLSB32(this.upper);
		return this;
	}

	// Return the location of the least significant bit
	LSB() {
		return this.lower? getLSB32(this.lower): 32 + getLSB32(this.upper);
	}

	// Clear the least significant bit and return its prior location
	popRetLSB() {
		let idx = this.LSB();
		this.popLSB();
		return idx;
	}

	// Logical operations on 64 bit unsigned ints
	AND(other) {
		this.lower = U32(this.lower & other.lower);
		this.upper = U32(this.upper & other.upper);
		return this;
	}

	// Combine & and ~ into one operation for simpler logic
	AND_NOT(other) {
		this.lower = U32(this.lower & ~other.lower);
		this.upper = U32(this.upper & ~other.upper);
		return this;
	}

	OR(other) {
		this.lower = U32(this.lower | other.lower);
		this.upper = U32(this.upper | other.upper);
		return this;
	}

	XOR(other) {
		this.lower = U32(this.lower ^ other.lower);
		this.upper = U32(this.upper ^ other.upper);
		return this;
	}

	NOT() {
		this.lower = U32(~this.lower);
		this.upper = U32(~this.upper);
		return this;
	}

	SHL(v) {
		v = U32(v);
		if (v > 31) {
			this.upper = U32(this.lower << (v - 32));
			this.lower = U32(0);
		}
		else if (v > 0) {
			this.upper = U32((this.upper << v) | (this.lower >>> (32 - v)));
			this.lower = U32(this.lower << v);
		}
		return this;
	}

	SHR(v) {
		v = U32(v);
		if (v > 31) {
			this.lower = this.upper >>> (v - 32);
			this.upper = U32(0);
		}
		else if (v > 0) {
			this.lower = U32((this.lower >>> v) | (this.upper << (32 - v)));
			this.upper >>>= v;
		}
		return this;
	}

	// Shift left if it's a positive integer, otherwise right
	SHIFT(v) {
		if (v > 63 || v < -63) this.lower = this.upper = U32(0);
		else if (v > 0) this.SHL(v);
		else if (v < 0) this.SHR(-v);
		return this;
	}
	
	equals(other) {
		return this.lower === other.lower && this.upper === other.upper;
	}

	copy() {
		return new Bitboard(this.lower, this.upper);
	}

}