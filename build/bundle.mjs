var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/big-integer/BigInteger.js
var require_BigInteger = __commonJS({
  "node_modules/big-integer/BigInteger.js"(exports2, module2) {
    var bigInt2 = function(undefined2) {
      "use strict";
      var BASE = 1e7, LOG_BASE = 7, MAX_INT = 9007199254740992, MAX_INT_ARR = smallToArray(MAX_INT), DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
      var supportsNativeBigInt = typeof BigInt === "function";
      function Integer(v, radix, alphabet, caseSensitive) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        return parseValue(v);
      }
      function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
      }
      BigInteger.prototype = Object.create(Integer.prototype);
      function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
      }
      SmallInteger.prototype = Object.create(Integer.prototype);
      function NativeBigInt(value) {
        this.value = value;
      }
      NativeBigInt.prototype = Object.create(Integer.prototype);
      function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
      }
      function smallToArray(n) {
        if (n < 1e7)
          return [n];
        if (n < 1e14)
          return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
      }
      function arrayToSmall(arr) {
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
          switch (length) {
            case 0:
              return 0;
            case 1:
              return arr[0];
            case 2:
              return arr[0] + arr[1] * BASE;
            default:
              return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
          }
        }
        return arr;
      }
      function trim(v) {
        var i2 = v.length;
        while (v[--i2] === 0) ;
        v.length = i2 + 1;
      }
      function createArray(length) {
        var x = new Array(length);
        var i2 = -1;
        while (++i2 < length) {
          x[i2] = 0;
        }
        return x;
      }
      function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
      }
      function add(a, b) {
        var l_a = a.length, l_b = b.length, r = new Array(l_a), carry = 0, base = BASE, sum, i2;
        for (i2 = 0; i2 < l_b; i2++) {
          sum = a[i2] + b[i2] + carry;
          carry = sum >= base ? 1 : 0;
          r[i2] = sum - carry * base;
        }
        while (i2 < l_a) {
          sum = a[i2] + carry;
          carry = sum === base ? 1 : 0;
          r[i2++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
      }
      function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
      }
      function addSmall(a, carry) {
        var l = a.length, r = new Array(l), base = BASE, sum, i2;
        for (i2 = 0; i2 < l; i2++) {
          sum = a[i2] - base + carry;
          carry = Math.floor(sum / base);
          r[i2] = sum - carry * base;
          carry += 1;
        }
        while (carry > 0) {
          r[i2++] = carry % base;
          carry = Math.floor(carry / base);
        }
        return r;
      }
      BigInteger.prototype.add = function(v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
          return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
          return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
      };
      BigInteger.prototype.plus = BigInteger.prototype.add;
      SmallInteger.prototype.add = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
          return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
          if (isPrecise(a + b)) return new SmallInteger(a + b);
          b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
      };
      SmallInteger.prototype.plus = SmallInteger.prototype.add;
      NativeBigInt.prototype.add = function(v) {
        return new NativeBigInt(this.value + parseValue(v).value);
      };
      NativeBigInt.prototype.plus = NativeBigInt.prototype.add;
      function subtract(a, b) {
        var a_l = a.length, b_l = b.length, r = new Array(a_l), borrow = 0, base = BASE, i2, difference;
        for (i2 = 0; i2 < b_l; i2++) {
          difference = a[i2] - borrow - b[i2];
          if (difference < 0) {
            difference += base;
            borrow = 1;
          } else borrow = 0;
          r[i2] = difference;
        }
        for (i2 = b_l; i2 < a_l; i2++) {
          difference = a[i2] - borrow;
          if (difference < 0) difference += base;
          else {
            r[i2++] = difference;
            break;
          }
          r[i2] = difference;
        }
        for (; i2 < a_l; i2++) {
          r[i2] = a[i2];
        }
        trim(r);
        return r;
      }
      function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
          value = subtract(a, b);
        } else {
          value = subtract(b, a);
          sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
          if (sign) value = -value;
          return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
      }
      function subtractSmall(a, b, sign) {
        var l = a.length, r = new Array(l), carry = -b, base = BASE, i2, difference;
        for (i2 = 0; i2 < l; i2++) {
          difference = a[i2] + carry;
          carry = Math.floor(difference / base);
          difference %= base;
          r[i2] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
          if (sign) r = -r;
          return new SmallInteger(r);
        }
        return new BigInteger(r, sign);
      }
      BigInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
          return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
          return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
      };
      BigInteger.prototype.minus = BigInteger.prototype.subtract;
      SmallInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
          return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
          return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
      };
      SmallInteger.prototype.minus = SmallInteger.prototype.subtract;
      NativeBigInt.prototype.subtract = function(v) {
        return new NativeBigInt(this.value - parseValue(v).value);
      };
      NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;
      BigInteger.prototype.negate = function() {
        return new BigInteger(this.value, !this.sign);
      };
      SmallInteger.prototype.negate = function() {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
      };
      NativeBigInt.prototype.negate = function() {
        return new NativeBigInt(-this.value);
      };
      BigInteger.prototype.abs = function() {
        return new BigInteger(this.value, false);
      };
      SmallInteger.prototype.abs = function() {
        return new SmallInteger(Math.abs(this.value));
      };
      NativeBigInt.prototype.abs = function() {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
      };
      function multiplyLong(a, b) {
        var a_l = a.length, b_l = b.length, l = a_l + b_l, r = createArray(l), base = BASE, product, carry, i2, a_i, b_j;
        for (i2 = 0; i2 < a_l; ++i2) {
          a_i = a[i2];
          for (var j = 0; j < b_l; ++j) {
            b_j = b[j];
            product = a_i * b_j + r[i2 + j];
            carry = Math.floor(product / base);
            r[i2 + j] = product - carry * base;
            r[i2 + j + 1] += carry;
          }
        }
        trim(r);
        return r;
      }
      function multiplySmall(a, b) {
        var l = a.length, r = new Array(l), base = BASE, carry = 0, product, i2;
        for (i2 = 0; i2 < l; i2++) {
          product = a[i2] * b + carry;
          carry = Math.floor(product / base);
          r[i2] = product - carry * base;
        }
        while (carry > 0) {
          r[i2++] = carry % base;
          carry = Math.floor(carry / base);
        }
        return r;
      }
      function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
      }
      function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);
        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);
        var b = x.slice(n), a = x.slice(0, n), d = y.slice(n), c = y.slice(0, n);
        var ac = multiplyKaratsuba(a, c), bd = multiplyKaratsuba(b, d), abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
      }
      function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
      }
      BigInteger.prototype.multiply = function(v) {
        var n = parseValue(v), a = this.value, b = n.value, sign = this.sign !== n.sign, abs;
        if (n.isSmall) {
          if (b === 0) return Integer[0];
          if (b === 1) return this;
          if (b === -1) return this.negate();
          abs = Math.abs(b);
          if (abs < BASE) {
            return new BigInteger(multiplySmall(a, abs), sign);
          }
          b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length))
          return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
      };
      BigInteger.prototype.times = BigInteger.prototype.multiply;
      function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
          return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
      }
      SmallInteger.prototype._multiplyBySmall = function(a) {
        if (isPrecise(a.value * this.value)) {
          return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
      };
      BigInteger.prototype._multiplyBySmall = function(a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
      };
      SmallInteger.prototype.multiply = function(v) {
        return parseValue(v)._multiplyBySmall(this);
      };
      SmallInteger.prototype.times = SmallInteger.prototype.multiply;
      NativeBigInt.prototype.multiply = function(v) {
        return new NativeBigInt(this.value * parseValue(v).value);
      };
      NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;
      function square(a) {
        var l = a.length, r = createArray(l + l), base = BASE, product, carry, i2, a_i, a_j;
        for (i2 = 0; i2 < l; i2++) {
          a_i = a[i2];
          carry = 0 - a_i * a_i;
          for (var j = i2; j < l; j++) {
            a_j = a[j];
            product = 2 * (a_i * a_j) + r[i2 + j] + carry;
            carry = Math.floor(product / base);
            r[i2 + j] = product - carry * base;
          }
          r[i2 + l] = carry;
        }
        trim(r);
        return r;
      }
      BigInteger.prototype.square = function() {
        return new BigInteger(square(this.value), false);
      };
      SmallInteger.prototype.square = function() {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
      };
      NativeBigInt.prototype.square = function(v) {
        return new NativeBigInt(this.value * this.value);
      };
      function divMod1(a, b) {
        var a_l = a.length, b_l = b.length, base = BASE, result = createArray(b.length), divisorMostSignificantDigit = b[b_l - 1], lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), remainder = multiplySmall(a, lambda), divisor = multiplySmall(b, lambda), quotientDigit, shift, carry, borrow, i2, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
          quotientDigit = base - 1;
          if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
            quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
          }
          carry = 0;
          borrow = 0;
          l = divisor.length;
          for (i2 = 0; i2 < l; i2++) {
            carry += quotientDigit * divisor[i2];
            q = Math.floor(carry / base);
            borrow += remainder[shift + i2] - (carry - q * base);
            carry = q;
            if (borrow < 0) {
              remainder[shift + i2] = borrow + base;
              borrow = -1;
            } else {
              remainder[shift + i2] = borrow;
              borrow = 0;
            }
          }
          while (borrow !== 0) {
            quotientDigit -= 1;
            carry = 0;
            for (i2 = 0; i2 < l; i2++) {
              carry += remainder[shift + i2] - base + divisor[i2];
              if (carry < 0) {
                remainder[shift + i2] = carry + base;
                carry = 0;
              } else {
                remainder[shift + i2] = carry;
                carry = 1;
              }
            }
            borrow += carry;
          }
          result[shift] = quotientDigit;
        }
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
      }
      function divMod2(a, b) {
        var a_l = a.length, b_l = b.length, result = [], part = [], base = BASE, guess, xlen, highx, highy, check;
        while (a_l) {
          part.unshift(a[--a_l]);
          trim(part);
          if (compareAbs(part, b) < 0) {
            result.push(0);
            continue;
          }
          xlen = part.length;
          highx = part[xlen - 1] * base + part[xlen - 2];
          highy = b[b_l - 1] * base + b[b_l - 2];
          if (xlen > b_l) {
            highx = (highx + 1) * base;
          }
          guess = Math.ceil(highx / highy);
          do {
            check = multiplySmall(b, guess);
            if (compareAbs(check, part) <= 0) break;
            guess--;
          } while (guess);
          result.push(guess);
          part = subtract(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
      }
      function divModSmall(value, lambda) {
        var length = value.length, quotient = createArray(length), base = BASE, i2, q, remainder, divisor;
        remainder = 0;
        for (i2 = length - 1; i2 >= 0; --i2) {
          divisor = remainder * base + value[i2];
          q = truncate(divisor / lambda);
          remainder = divisor - q * lambda;
          quotient[i2] = q | 0;
        }
        return [quotient, remainder | 0];
      }
      function divModAny(self, v) {
        var value, n = parseValue(v);
        if (supportsNativeBigInt) {
          return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
        }
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
          if (n.isSmall) {
            return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
          }
          return [Integer[0], self];
        }
        if (n.isSmall) {
          if (b === 1) return [self, Integer[0]];
          if (b == -1) return [self.negate(), Integer[0]];
          var abs = Math.abs(b);
          if (abs < BASE) {
            value = divModSmall(a, abs);
            quotient = arrayToSmall(value[0]);
            var remainder = value[1];
            if (self.sign) remainder = -remainder;
            if (typeof quotient === "number") {
              if (self.sign !== n.sign) quotient = -quotient;
              return [new SmallInteger(quotient), new SmallInteger(remainder)];
            }
            return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
          }
          b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self];
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
        if (a.length + b.length <= 200)
          value = divMod1(a, b);
        else value = divMod2(a, b);
        quotient = value[0];
        var qSign = self.sign !== n.sign, mod = value[1], mSign = self.sign;
        if (typeof quotient === "number") {
          if (qSign) quotient = -quotient;
          quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
          if (mSign) mod = -mod;
          mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [quotient, mod];
      }
      BigInteger.prototype.divmod = function(v) {
        var result = divModAny(this, v);
        return {
          quotient: result[0],
          remainder: result[1]
        };
      };
      NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;
      BigInteger.prototype.divide = function(v) {
        return divModAny(this, v)[0];
      };
      NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function(v) {
        return new NativeBigInt(this.value / parseValue(v).value);
      };
      SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;
      BigInteger.prototype.mod = function(v) {
        return divModAny(this, v)[1];
      };
      NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function(v) {
        return new NativeBigInt(this.value % parseValue(v).value);
      };
      SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;
      BigInteger.prototype.pow = function(v) {
        var n = parseValue(v), a = this.value, b = n.value, value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
          return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
          if (isPrecise(value = Math.pow(a, b)))
            return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
          if (b & true) {
            y = y.times(x);
            --b;
          }
          if (b === 0) break;
          b /= 2;
          x = x.square();
        }
        return y;
      };
      SmallInteger.prototype.pow = BigInteger.prototype.pow;
      NativeBigInt.prototype.pow = function(v) {
        var n = parseValue(v);
        var a = this.value, b = n.value;
        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
        if (b === _0) return Integer[1];
        if (a === _0) return Integer[0];
        if (a === _1) return Integer[1];
        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.isNegative()) return new NativeBigInt(_0);
        var x = this;
        var y = Integer[1];
        while (true) {
          if ((b & _1) === _1) {
            y = y.times(x);
            --b;
          }
          if (b === _0) break;
          b /= _2;
          x = x.square();
        }
        return y;
      };
      BigInteger.prototype.modPow = function(exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1], base = this.mod(mod);
        if (exp.isNegative()) {
          exp = exp.multiply(Integer[-1]);
          base = base.modInv(mod);
        }
        while (exp.isPositive()) {
          if (base.isZero()) return Integer[0];
          if (exp.isOdd()) r = r.multiply(base).mod(mod);
          exp = exp.divide(2);
          base = base.square().mod(mod);
        }
        return r;
      };
      NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;
      function compareAbs(a, b) {
        if (a.length !== b.length) {
          return a.length > b.length ? 1 : -1;
        }
        for (var i2 = a.length - 1; i2 >= 0; i2--) {
          if (a[i2] !== b[i2]) return a[i2] > b[i2] ? 1 : -1;
        }
        return 0;
      }
      BigInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v), a = this.value, b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
      };
      SmallInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v), a = Math.abs(this.value), b = n.value;
        if (n.isSmall) {
          b = Math.abs(b);
          return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
      };
      NativeBigInt.prototype.compareAbs = function(v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a;
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
      };
      BigInteger.prototype.compare = function(v) {
        if (v === Infinity) {
          return -1;
        }
        if (v === -Infinity) {
          return 1;
        }
        var n = parseValue(v), a = this.value, b = n.value;
        if (this.sign !== n.sign) {
          return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
          return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
      };
      BigInteger.prototype.compareTo = BigInteger.prototype.compare;
      SmallInteger.prototype.compare = function(v) {
        if (v === Infinity) {
          return -1;
        }
        if (v === -Infinity) {
          return 1;
        }
        var n = parseValue(v), a = this.value, b = n.value;
        if (n.isSmall) {
          return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
          return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
      };
      SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;
      NativeBigInt.prototype.compare = function(v) {
        if (v === Infinity) {
          return -1;
        }
        if (v === -Infinity) {
          return 1;
        }
        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1;
      };
      NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;
      BigInteger.prototype.equals = function(v) {
        return this.compare(v) === 0;
      };
      NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;
      BigInteger.prototype.notEquals = function(v) {
        return this.compare(v) !== 0;
      };
      NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;
      BigInteger.prototype.greater = function(v) {
        return this.compare(v) > 0;
      };
      NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;
      BigInteger.prototype.lesser = function(v) {
        return this.compare(v) < 0;
      };
      NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;
      BigInteger.prototype.greaterOrEquals = function(v) {
        return this.compare(v) >= 0;
      };
      NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;
      BigInteger.prototype.lesserOrEquals = function(v) {
        return this.compare(v) <= 0;
      };
      NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;
      BigInteger.prototype.isEven = function() {
        return (this.value[0] & 1) === 0;
      };
      SmallInteger.prototype.isEven = function() {
        return (this.value & 1) === 0;
      };
      NativeBigInt.prototype.isEven = function() {
        return (this.value & BigInt(1)) === BigInt(0);
      };
      BigInteger.prototype.isOdd = function() {
        return (this.value[0] & 1) === 1;
      };
      SmallInteger.prototype.isOdd = function() {
        return (this.value & 1) === 1;
      };
      NativeBigInt.prototype.isOdd = function() {
        return (this.value & BigInt(1)) === BigInt(1);
      };
      BigInteger.prototype.isPositive = function() {
        return !this.sign;
      };
      SmallInteger.prototype.isPositive = function() {
        return this.value > 0;
      };
      NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;
      BigInteger.prototype.isNegative = function() {
        return this.sign;
      };
      SmallInteger.prototype.isNegative = function() {
        return this.value < 0;
      };
      NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;
      BigInteger.prototype.isUnit = function() {
        return false;
      };
      SmallInteger.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
      };
      NativeBigInt.prototype.isUnit = function() {
        return this.abs().value === BigInt(1);
      };
      BigInteger.prototype.isZero = function() {
        return false;
      };
      SmallInteger.prototype.isZero = function() {
        return this.value === 0;
      };
      NativeBigInt.prototype.isZero = function() {
        return this.value === BigInt(0);
      };
      BigInteger.prototype.isDivisibleBy = function(v) {
        var n = parseValue(v);
        if (n.isZero()) return false;
        if (n.isUnit()) return true;
        if (n.compareAbs(2) === 0) return this.isEven();
        return this.mod(n).isZero();
      };
      NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;
      function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(49)) return true;
      }
      function millerRabinTest(n, a) {
        var nPrev = n.prev(), b = nPrev, r = 0, d, t2, i2, x;
        while (b.isEven()) b = b.divide(2), r++;
        next: for (i2 = 0; i2 < a.length; i2++) {
          if (n.lesser(a[i2])) continue;
          x = bigInt2(a[i2]).modPow(b, n);
          if (x.isUnit() || x.equals(nPrev)) continue;
          for (d = r - 1; d != 0; d--) {
            x = x.square().mod(n);
            if (x.isUnit()) return false;
            if (x.equals(nPrev)) continue next;
          }
          return false;
        }
        return true;
      }
      BigInteger.prototype.isPrime = function(strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined2) return isPrime;
        var n = this.abs();
        var bits = n.bitLength();
        if (bits <= 64)
          return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logN = Math.log(2) * bits.toJSNumber();
        var t2 = Math.ceil(strict === true ? 2 * Math.pow(logN, 2) : logN);
        for (var a = [], i2 = 0; i2 < t2; i2++) {
          a.push(bigInt2(i2 + 2));
        }
        return millerRabinTest(n, a);
      };
      NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;
      BigInteger.prototype.isProbablePrime = function(iterations, rng) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined2) return isPrime;
        var n = this.abs();
        var t2 = iterations === undefined2 ? 5 : iterations;
        for (var a = [], i2 = 0; i2 < t2; i2++) {
          a.push(bigInt2.randBetween(2, n.minus(2), rng));
        }
        return millerRabinTest(n, a);
      };
      NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;
      BigInteger.prototype.modInv = function(n) {
        var t2 = bigInt2.zero, newT = bigInt2.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.isZero()) {
          q = r.divide(newR);
          lastT = t2;
          lastR = r;
          t2 = newT;
          r = newR;
          newT = lastT.subtract(q.multiply(newT));
          newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t2.compare(0) === -1) {
          t2 = t2.add(n);
        }
        if (this.isNegative()) {
          return t2.negate();
        }
        return t2;
      };
      NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;
      BigInteger.prototype.next = function() {
        var value = this.value;
        if (this.sign) {
          return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
      };
      SmallInteger.prototype.next = function() {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
      };
      NativeBigInt.prototype.next = function() {
        return new NativeBigInt(this.value + BigInt(1));
      };
      BigInteger.prototype.prev = function() {
        var value = this.value;
        if (this.sign) {
          return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
      };
      SmallInteger.prototype.prev = function() {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
      };
      NativeBigInt.prototype.prev = function() {
        return new NativeBigInt(this.value - BigInt(1));
      };
      var powersOfTwo = [1];
      while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
      var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];
      function shift_isSmall(n) {
        return Math.abs(n) <= BASE;
      }
      BigInteger.prototype.shiftLeft = function(v) {
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
          throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        if (result.isZero()) return result;
        while (n >= powers2Length) {
          result = result.multiply(highestPower2);
          n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
      };
      NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;
      BigInteger.prototype.shiftRight = function(v) {
        var remQuo;
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
          throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
          if (result.isZero() || result.isNegative() && result.isUnit()) return result;
          remQuo = divModAny(result, highestPower2);
          result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
          n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
      };
      NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;
      function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x, yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while (!xRem.isZero() || !yRem.isZero()) {
          xDivMod = divModAny(xRem, highestPower2);
          xDigit = xDivMod[1].toJSNumber();
          if (xSign) {
            xDigit = highestPower2 - 1 - xDigit;
          }
          yDivMod = divModAny(yRem, highestPower2);
          yDigit = yDivMod[1].toJSNumber();
          if (ySign) {
            yDigit = highestPower2 - 1 - yDigit;
          }
          xRem = xDivMod[0];
          yRem = yDivMod[0];
          result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt2(-1) : bigInt2(0);
        for (var i2 = result.length - 1; i2 >= 0; i2 -= 1) {
          sum = sum.multiply(highestPower2).add(bigInt2(result[i2]));
        }
        return sum;
      }
      BigInteger.prototype.not = function() {
        return this.negate().prev();
      };
      NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;
      BigInteger.prototype.and = function(n) {
        return bitwise(this, n, function(a, b) {
          return a & b;
        });
      };
      NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;
      BigInteger.prototype.or = function(n) {
        return bitwise(this, n, function(a, b) {
          return a | b;
        });
      };
      NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;
      BigInteger.prototype.xor = function(n) {
        return bitwise(this, n, function(a, b) {
          return a ^ b;
        });
      };
      NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;
      var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
      function roughLOB(n) {
        var v = n.value, x = typeof v === "number" ? v | LOBMASK_I : typeof v === "bigint" ? v | BigInt(LOBMASK_I) : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
      }
      function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
          var tmp = integerLogarithm(value, base.square(base));
          var p = tmp.p;
          var e = tmp.e;
          var t2 = p.multiply(base);
          return t2.compareTo(value) <= 0 ? { p: t2, e: e * 2 + 1 } : { p, e: e * 2 };
        }
        return { p: bigInt2(1), e: 0 };
      }
      BigInteger.prototype.bitLength = function() {
        var n = this;
        if (n.compareTo(bigInt2(0)) < 0) {
          n = n.negate().subtract(bigInt2(1));
        }
        if (n.compareTo(bigInt2(0)) === 0) {
          return bigInt2(0);
        }
        return bigInt2(integerLogarithm(n, bigInt2(2)).e).add(bigInt2(1));
      };
      NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;
      function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
      }
      function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
      }
      function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t2;
        while (a.isEven() && b.isEven()) {
          d = min(roughLOB(a), roughLOB(b));
          a = a.divide(d);
          b = b.divide(d);
          c = c.multiply(d);
        }
        while (a.isEven()) {
          a = a.divide(roughLOB(a));
        }
        do {
          while (b.isEven()) {
            b = b.divide(roughLOB(b));
          }
          if (a.greater(b)) {
            t2 = b;
            b = a;
            a = t2;
          }
          b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
      }
      function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
      }
      function randBetween(a, b, rng) {
        a = parseValue(a);
        b = parseValue(b);
        var usedRNG = rng || Math.random;
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
        var digits = toBase(range, BASE).value;
        var result = [], restricted = true;
        for (var i2 = 0; i2 < digits.length; i2++) {
          var top = restricted ? digits[i2] + (i2 + 1 < digits.length ? digits[i2 + 1] / BASE : 0) : BASE;
          var digit = truncate(usedRNG() * top);
          result.push(digit);
          if (digit < digits[i2]) restricted = false;
        }
        return low.add(Integer.fromArray(result, BASE, false));
      }
      var parseBase = function(text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);
        if (!caseSensitive) {
          text = text.toLowerCase();
          alphabet = alphabet.toLowerCase();
        }
        var length = text.length;
        var i2;
        var absBase = Math.abs(base);
        var alphabetValues = {};
        for (i2 = 0; i2 < alphabet.length; i2++) {
          alphabetValues[alphabet[i2]] = i2;
        }
        for (i2 = 0; i2 < length; i2++) {
          var c = text[i2];
          if (c === "-") continue;
          if (c in alphabetValues) {
            if (alphabetValues[c] >= absBase) {
              if (c === "1" && absBase === 1) continue;
              throw new Error(c + " is not a valid digit in base " + base + ".");
            }
          }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for (i2 = isNegative ? 1 : 0; i2 < text.length; i2++) {
          var c = text[i2];
          if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
          else if (c === "<") {
            var start = i2;
            do {
              i2++;
            } while (text[i2] !== ">" && i2 < text.length);
            digits.push(parseValue(text.slice(start + 1, i2)));
          } else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
      };
      function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i2;
        for (i2 = digits.length - 1; i2 >= 0; i2--) {
          val = val.add(digits[i2].times(pow));
          pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
      }
      function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
          return alphabet[digit];
        }
        return "<" + digit + ">";
      }
      function toBase(n, base) {
        base = bigInt2(base);
        if (base.isZero()) {
          if (n.isZero()) return { value: [0], isNegative: false };
          throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
          if (n.isZero()) return { value: [0], isNegative: false };
          if (n.isNegative())
            return {
              value: [].concat.apply(
                [],
                Array.apply(null, Array(-n.toJSNumber())).map(Array.prototype.valueOf, [1, 0])
              ),
              isNegative: false
            };
          var arr = Array.apply(null, Array(n.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
          arr.unshift([1]);
          return {
            value: [].concat.apply([], arr),
            isNegative: false
          };
        }
        var neg = false;
        if (n.isNegative() && base.isPositive()) {
          neg = true;
          n = n.abs();
        }
        if (base.isUnit()) {
          if (n.isZero()) return { value: [0], isNegative: false };
          return {
            value: Array.apply(null, Array(n.toJSNumber())).map(Number.prototype.valueOf, 1),
            isNegative: neg
          };
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
          divmod = left.divmod(base);
          left = divmod.quotient;
          var digit = divmod.remainder;
          if (digit.isNegative()) {
            digit = base.minus(digit).abs();
            left = left.next();
          }
          out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return { value: out.reverse(), isNegative: neg };
      }
      function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function(x) {
          return stringify(x, alphabet);
        }).join("");
      }
      BigInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
      };
      SmallInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
      };
      NativeBigInt.prototype.toArray = function(radix) {
        return toBase(this, radix);
      };
      BigInteger.prototype.toString = function(radix, alphabet) {
        if (radix === undefined2) radix = 10;
        if (radix !== 10 || alphabet) return toBaseString(this, radix, alphabet);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
          digit = String(v[l]);
          str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
      };
      SmallInteger.prototype.toString = function(radix, alphabet) {
        if (radix === undefined2) radix = 10;
        if (radix != 10 || alphabet) return toBaseString(this, radix, alphabet);
        return String(this.value);
      };
      NativeBigInt.prototype.toString = SmallInteger.prototype.toString;
      NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
        return this.toString();
      };
      BigInteger.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
      };
      BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;
      SmallInteger.prototype.valueOf = function() {
        return this.value;
      };
      SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
      NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function() {
        return parseInt(this.toString(), 10);
      };
      function parseStringValue(v) {
        if (isPrecise(+v)) {
          var x = +v;
          if (x === truncate(x))
            return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
          throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
          var exp = split[1];
          if (exp[0] === "+") exp = exp.slice(1);
          exp = +exp;
          if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
          var text = split[0];
          var decimalPlace = text.indexOf(".");
          if (decimalPlace >= 0) {
            exp -= text.length - decimalPlace - 1;
            text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
          }
          if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
          text += new Array(exp + 1).join("0");
          v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        if (supportsNativeBigInt) {
          return new NativeBigInt(BigInt(sign ? "-" + v : v));
        }
        var r = [], max2 = v.length, l = LOG_BASE, min2 = max2 - l;
        while (max2 > 0) {
          r.push(+v.slice(min2, max2));
          min2 -= l;
          if (min2 < 0) min2 = 0;
          max2 -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
      }
      function parseNumberValue(v) {
        if (supportsNativeBigInt) {
          return new NativeBigInt(BigInt(v));
        }
        if (isPrecise(v)) {
          if (v !== truncate(v)) throw new Error(v + " is not an integer.");
          return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
      }
      function parseValue(v) {
        if (typeof v === "number") {
          return parseNumberValue(v);
        }
        if (typeof v === "string") {
          return parseStringValue(v);
        }
        if (typeof v === "bigint") {
          return new NativeBigInt(v);
        }
        return v;
      }
      for (var i = 0; i < 1e3; i++) {
        Integer[i] = parseValue(i);
        if (i > 0) Integer[-i] = parseValue(-i);
      }
      Integer.one = Integer[1];
      Integer.zero = Integer[0];
      Integer.minusOne = Integer[-1];
      Integer.max = max;
      Integer.min = min;
      Integer.gcd = gcd;
      Integer.lcm = lcm;
      Integer.isInstance = function(x) {
        return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt;
      };
      Integer.randBetween = randBetween;
      Integer.fromArray = function(digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
      };
      return Integer;
    }();
    if (typeof module2 !== "undefined" && module2.hasOwnProperty("exports")) {
      module2.exports = bigInt2;
    }
    if (typeof define === "function" && define.amd) {
      define(function() {
        return bigInt2;
      });
    }
  }
});

// node_modules/wasmbuilder/src/utils.js
var require_utils = __commonJS({
  "node_modules/wasmbuilder/src/utils.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    function toNumber(n) {
      let v;
      if (typeof n == "string") {
        if (n.slice(0, 2).toLowerCase() == "0x") {
          v = bigInt2(n.slice(2), 16);
        } else {
          v = bigInt2(n);
        }
      } else {
        v = bigInt2(n);
      }
      return v;
    }
    function u32(n) {
      const b = [];
      const v = toNumber(n);
      b.push(v.and(255).toJSNumber());
      b.push(v.shiftRight(8).and(255).toJSNumber());
      b.push(v.shiftRight(16).and(255).toJSNumber());
      b.push(v.shiftRight(24).and(255).toJSNumber());
      return b;
    }
    function u64(n) {
      const b = [];
      const v = toNumber(n);
      b.push(v.and(255).toJSNumber());
      b.push(v.shiftRight(8).and(255).toJSNumber());
      b.push(v.shiftRight(16).and(255).toJSNumber());
      b.push(v.shiftRight(24).and(255).toJSNumber());
      b.push(v.shiftRight(32).and(255).toJSNumber());
      b.push(v.shiftRight(40).and(255).toJSNumber());
      b.push(v.shiftRight(48).and(255).toJSNumber());
      b.push(v.shiftRight(56).and(255).toJSNumber());
      return b;
    }
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 128) utf8.push(charcode);
        else if (charcode < 2048) {
          utf8.push(
            192 | charcode >> 6,
            128 | charcode & 63
          );
        } else if (charcode < 55296 || charcode >= 57344) {
          utf8.push(
            224 | charcode >> 12,
            128 | charcode >> 6 & 63,
            128 | charcode & 63
          );
        } else {
          i++;
          charcode = 65536 + ((charcode & 1023) << 10 | str.charCodeAt(i) & 1023);
          utf8.push(
            240 | charcode >> 18,
            128 | charcode >> 12 & 63,
            128 | charcode >> 6 & 63,
            128 | charcode & 63
          );
        }
      }
      return utf8;
    }
    function string(str) {
      const bytes = toUTF8Array(str);
      return [...varuint32(bytes.length), ...bytes];
    }
    function varuint(n) {
      const code = [];
      let v = toNumber(n);
      if (v.isNegative()) throw new Error("Number cannot be negative");
      while (!v.isZero()) {
        code.push(v.and(127).toJSNumber());
        v = v.shiftRight(7);
      }
      if (code.length == 0) code.push(0);
      for (let i = 0; i < code.length - 1; i++) {
        code[i] = code[i] | 128;
      }
      return code;
    }
    function varint(_n) {
      let n, sign;
      const bits = _n.bitLength().toJSNumber();
      if (_n < 0) {
        sign = true;
        n = bigInt2.one.shiftLeft(bits).add(_n);
      } else {
        sign = false;
        n = toNumber(_n);
      }
      const paddingBits = 7 - bits % 7;
      const padding = bigInt2.one.shiftLeft(paddingBits).minus(1).shiftLeft(bits);
      const paddingMask = (1 << 7 - paddingBits) - 1 | 128;
      const code = varuint(n.add(padding));
      if (!sign) {
        code[code.length - 1] = code[code.length - 1] & paddingMask;
      }
      return code;
    }
    function varint32(n) {
      let v = toNumber(n);
      if (v.greater(bigInt2("FFFFFFFF", 16))) throw new Error("Number too big");
      if (v.greater(bigInt2("7FFFFFFF", 16))) v = v.minus(bigInt2("100000000", 16));
      if (v.lesser(bigInt2("-80000000", 16))) throw new Error("Number too small");
      return varint(v);
    }
    function varint64(n) {
      let v = toNumber(n);
      if (v.greater(bigInt2("FFFFFFFFFFFFFFFF", 16))) throw new Error("Number too big");
      if (v.greater(bigInt2("7FFFFFFFFFFFFFFF", 16))) v = v.minus(bigInt2("10000000000000000", 16));
      if (v.lesser(bigInt2("-8000000000000000", 16))) throw new Error("Number too small");
      return varint(v);
    }
    function varuint32(n) {
      let v = toNumber(n);
      if (v.greater(bigInt2("FFFFFFFF", 16))) throw new Error("Number too big");
      return varuint(v);
    }
    function varuint64(n) {
      let v = toNumber(n);
      if (v.greater(bigInt2("FFFFFFFFFFFFFFFF", 16))) throw new Error("Number too big");
      return varuint(v);
    }
    function toHexString(byteArray) {
      return Array.from(byteArray, function(byte) {
        return ("0" + (byte & 255).toString(16)).slice(-2);
      }).join("");
    }
    module2.exports.toNumber = toNumber;
    module2.exports.u32 = u32;
    module2.exports.u64 = u64;
    module2.exports.varuint32 = varuint32;
    module2.exports.varuint64 = varuint64;
    module2.exports.varint32 = varint32;
    module2.exports.varint64 = varint64;
    module2.exports.string = string;
    module2.exports.toHexString = toHexString;
  }
});

// node_modules/wasmbuilder/src/codebuilder.js
var require_codebuilder = __commonJS({
  "node_modules/wasmbuilder/src/codebuilder.js"(exports2, module2) {
    var utils = require_utils();
    var CodeBuilder = class {
      constructor(func) {
        this.func = func;
        this.functionName = func.functionName;
        this.module = func.module;
      }
      setLocal(localName, valCode) {
        const idx = this.func.localIdxByName[localName];
        if (idx === void 0)
          throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
        return [...valCode, 33, ...utils.varuint32(idx)];
      }
      teeLocal(localName, valCode) {
        const idx = this.func.localIdxByName[localName];
        if (idx === void 0)
          throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
        return [...valCode, 34, ...utils.varuint32(idx)];
      }
      getLocal(localName) {
        const idx = this.func.localIdxByName[localName];
        if (idx === void 0)
          throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
        return [32, ...utils.varuint32(idx)];
      }
      i64_load8_s(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 0 : _align;
        return [...idxCode, 48, align, ...utils.varuint32(offset)];
      }
      i64_load8_u(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 0 : _align;
        return [...idxCode, 49, align, ...utils.varuint32(offset)];
      }
      i64_load16_s(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 1 : _align;
        return [...idxCode, 50, align, ...utils.varuint32(offset)];
      }
      i64_load16_u(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 1 : _align;
        return [...idxCode, 51, align, ...utils.varuint32(offset)];
      }
      i64_load32_s(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 2 : _align;
        return [...idxCode, 52, align, ...utils.varuint32(offset)];
      }
      i64_load32_u(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 2 : _align;
        return [...idxCode, 53, align, ...utils.varuint32(offset)];
      }
      i64_load(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 3 : _align;
        return [...idxCode, 41, align, ...utils.varuint32(offset)];
      }
      i64_store32(idxCode, _offset, _align, _codeVal) {
        let offset, align, codeVal;
        if (Array.isArray(_offset)) {
          offset = 0;
          align = 2;
          codeVal = _offset;
        } else if (Array.isArray(_align)) {
          offset = _offset;
          align = 2;
          codeVal = _align;
        } else if (Array.isArray(_codeVal)) {
          offset = _offset;
          align = _align;
          codeVal = _codeVal;
        }
        return [...idxCode, ...codeVal, 62, align, ...utils.varuint32(offset)];
      }
      i64_store(idxCode, _offset, _align, _codeVal) {
        let offset, align, codeVal;
        if (Array.isArray(_offset)) {
          offset = 0;
          align = 3;
          codeVal = _offset;
        } else if (Array.isArray(_align)) {
          offset = _offset;
          align = 3;
          codeVal = _align;
        } else if (Array.isArray(_codeVal)) {
          offset = _offset;
          align = _align;
          codeVal = _codeVal;
        }
        return [...idxCode, ...codeVal, 55, align, ...utils.varuint32(offset)];
      }
      i32_load8_s(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 0 : _align;
        return [...idxCode, 44, align, ...utils.varuint32(offset)];
      }
      i32_load8_u(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 0 : _align;
        return [...idxCode, 45, align, ...utils.varuint32(offset)];
      }
      i32_load16_s(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 1 : _align;
        return [...idxCode, 46, align, ...utils.varuint32(offset)];
      }
      i32_load16_u(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 1 : _align;
        return [...idxCode, 47, align, ...utils.varuint32(offset)];
      }
      i32_load(idxCode, _offset, _align) {
        const offset = _offset || 0;
        const align = _align === void 0 ? 2 : _align;
        return [...idxCode, 40, align, ...utils.varuint32(offset)];
      }
      i32_store(idxCode, _offset, _align, _codeVal) {
        let offset, align, codeVal;
        if (Array.isArray(_offset)) {
          offset = 0;
          align = 2;
          codeVal = _offset;
        } else if (Array.isArray(_align)) {
          offset = _offset;
          align = 2;
          codeVal = _align;
        } else if (Array.isArray(_codeVal)) {
          offset = _offset;
          align = _align;
          codeVal = _codeVal;
        }
        return [...idxCode, ...codeVal, 54, align, ...utils.varuint32(offset)];
      }
      call(fnName, ...args) {
        const idx = this.module.functionIdxByName[fnName];
        if (idx === void 0)
          throw new Error(`Function not defined: Function: ${fnName}`);
        return [...[].concat(...args), 16, ...utils.varuint32(idx)];
      }
      if(condCode, thenCode, elseCode) {
        if (elseCode) {
          return [...condCode, 4, 64, ...thenCode, 5, ...elseCode, 11];
        } else {
          return [...condCode, 4, 64, ...thenCode, 11];
        }
      }
      block(bCode) {
        return [2, 64, ...bCode, 11];
      }
      loop(...args) {
        return [3, 64, ...[].concat(...[...args]), 11];
      }
      br_if(relPath, condCode) {
        return [...condCode, 13, ...utils.varuint32(relPath)];
      }
      br(relPath) {
        return [12, ...utils.varuint32(relPath)];
      }
      ret(rCode) {
        return [...rCode, 15];
      }
      drop(dCode) {
        return [...dCode, 26];
      }
      i64_const(num) {
        return [66, ...utils.varint64(num)];
      }
      i32_const(num) {
        return [65, ...utils.varint32(num)];
      }
      i64_eqz(opcode) {
        return [...opcode, 80];
      }
      i64_eq(op1code, op2code) {
        return [...op1code, ...op2code, 81];
      }
      i64_ne(op1code, op2code) {
        return [...op1code, ...op2code, 82];
      }
      i64_lt_s(op1code, op2code) {
        return [...op1code, ...op2code, 83];
      }
      i64_lt_u(op1code, op2code) {
        return [...op1code, ...op2code, 84];
      }
      i64_gt_s(op1code, op2code) {
        return [...op1code, ...op2code, 85];
      }
      i64_gt_u(op1code, op2code) {
        return [...op1code, ...op2code, 86];
      }
      i64_le_s(op1code, op2code) {
        return [...op1code, ...op2code, 87];
      }
      i64_le_u(op1code, op2code) {
        return [...op1code, ...op2code, 88];
      }
      i64_ge_s(op1code, op2code) {
        return [...op1code, ...op2code, 89];
      }
      i64_ge_u(op1code, op2code) {
        return [...op1code, ...op2code, 90];
      }
      i64_add(op1code, op2code) {
        return [...op1code, ...op2code, 124];
      }
      i64_sub(op1code, op2code) {
        return [...op1code, ...op2code, 125];
      }
      i64_mul(op1code, op2code) {
        return [...op1code, ...op2code, 126];
      }
      i64_div_s(op1code, op2code) {
        return [...op1code, ...op2code, 127];
      }
      i64_div_u(op1code, op2code) {
        return [...op1code, ...op2code, 128];
      }
      i64_rem_s(op1code, op2code) {
        return [...op1code, ...op2code, 129];
      }
      i64_rem_u(op1code, op2code) {
        return [...op1code, ...op2code, 130];
      }
      i64_and(op1code, op2code) {
        return [...op1code, ...op2code, 131];
      }
      i64_or(op1code, op2code) {
        return [...op1code, ...op2code, 132];
      }
      i64_xor(op1code, op2code) {
        return [...op1code, ...op2code, 133];
      }
      i64_shl(op1code, op2code) {
        return [...op1code, ...op2code, 134];
      }
      i64_shr_s(op1code, op2code) {
        return [...op1code, ...op2code, 135];
      }
      i64_shr_u(op1code, op2code) {
        return [...op1code, ...op2code, 136];
      }
      i64_extend_i32_s(op1code) {
        return [...op1code, 172];
      }
      i64_extend_i32_u(op1code) {
        return [...op1code, 173];
      }
      i32_eqz(op1code) {
        return [...op1code, 69];
      }
      i32_eq(op1code, op2code) {
        return [...op1code, ...op2code, 70];
      }
      i32_ne(op1code, op2code) {
        return [...op1code, ...op2code, 71];
      }
      i32_lt_s(op1code, op2code) {
        return [...op1code, ...op2code, 72];
      }
      i32_lt_u(op1code, op2code) {
        return [...op1code, ...op2code, 73];
      }
      i32_gt_s(op1code, op2code) {
        return [...op1code, ...op2code, 74];
      }
      i32_gt_u(op1code, op2code) {
        return [...op1code, ...op2code, 75];
      }
      i32_le_s(op1code, op2code) {
        return [...op1code, ...op2code, 76];
      }
      i32_le_u(op1code, op2code) {
        return [...op1code, ...op2code, 77];
      }
      i32_ge_s(op1code, op2code) {
        return [...op1code, ...op2code, 78];
      }
      i32_ge_u(op1code, op2code) {
        return [...op1code, ...op2code, 79];
      }
      i32_add(op1code, op2code) {
        return [...op1code, ...op2code, 106];
      }
      i32_sub(op1code, op2code) {
        return [...op1code, ...op2code, 107];
      }
      i32_mul(op1code, op2code) {
        return [...op1code, ...op2code, 108];
      }
      i32_div_s(op1code, op2code) {
        return [...op1code, ...op2code, 109];
      }
      i32_div_u(op1code, op2code) {
        return [...op1code, ...op2code, 110];
      }
      i32_rem_s(op1code, op2code) {
        return [...op1code, ...op2code, 111];
      }
      i32_rem_u(op1code, op2code) {
        return [...op1code, ...op2code, 112];
      }
      i32_and(op1code, op2code) {
        return [...op1code, ...op2code, 113];
      }
      i32_or(op1code, op2code) {
        return [...op1code, ...op2code, 114];
      }
      i32_xor(op1code, op2code) {
        return [...op1code, ...op2code, 115];
      }
      i32_shl(op1code, op2code) {
        return [...op1code, ...op2code, 116];
      }
      i32_shr_s(op1code, op2code) {
        return [...op1code, ...op2code, 117];
      }
      i32_shr_u(op1code, op2code) {
        return [...op1code, ...op2code, 118];
      }
      i32_rotl(op1code, op2code) {
        return [...op1code, ...op2code, 119];
      }
      i32_rotr(op1code, op2code) {
        return [...op1code, ...op2code, 120];
      }
      i32_wrap_i64(op1code) {
        return [...op1code, 167];
      }
      unreachable() {
        return [0];
      }
    };
    module2.exports = CodeBuilder;
  }
});

// node_modules/wasmbuilder/src/functionbuilder.js
var require_functionbuilder = __commonJS({
  "node_modules/wasmbuilder/src/functionbuilder.js"(exports2, module2) {
    var CodeBuilder = require_codebuilder();
    var utils = require_utils();
    var typeCodes = {
      "i32": 127,
      "i64": 126,
      "f32": 125,
      "f64": 124,
      "anyfunc": 112,
      "func": 96,
      "emptyblock": 64
    };
    var FunctionBuilder = class {
      constructor(module3, fnName, fnType, moduleName, fieldName) {
        if (fnType == "import") {
          this.fnType = "import";
          this.moduleName = moduleName;
          this.fieldName = fieldName;
        } else if (fnType == "internal") {
          this.fnType = "internal";
        } else {
          throw new Error("Invalid function fnType: " + fnType);
        }
        this.module = module3;
        this.fnName = fnName;
        this.params = [];
        this.locals = [];
        this.localIdxByName = {};
        this.code = [];
        this.returnType = null;
        this.nextLocal = 0;
      }
      addParam(paramName, paramType) {
        if (this.localIdxByName[paramName])
          throw new Error(`param already exists. Function: ${this.fnName}, Param: ${paramName} `);
        const idx = this.nextLocal++;
        this.localIdxByName[paramName] = idx;
        this.params.push({
          type: paramType
        });
      }
      addLocal(localName, localType, _length) {
        const length = _length || 1;
        if (this.localIdxByName[localName])
          throw new Error(`local already exists. Function: ${this.fnName}, Param: ${localName} `);
        const idx = this.nextLocal++;
        this.localIdxByName[localName] = idx;
        this.locals.push({
          type: localType,
          length
        });
      }
      setReturnType(returnType) {
        if (this.returnType)
          throw new Error(`returnType already defined. Function: ${this.fnName}`);
        this.returnType = returnType;
      }
      getSignature() {
        const params = [...utils.varuint32(this.params.length), ...this.params.map((p) => typeCodes[p.type])];
        const returns = this.returnType ? [1, typeCodes[this.returnType]] : [0];
        return [96, ...params, ...returns];
      }
      getBody() {
        const locals = this.locals.map((l) => [
          ...utils.varuint32(l.length),
          typeCodes[l.type]
        ]);
        const body = [
          ...utils.varuint32(this.locals.length),
          ...[].concat(...locals),
          ...this.code,
          11
        ];
        return [
          ...utils.varuint32(body.length),
          ...body
        ];
      }
      addCode(...code) {
        this.code.push(...[].concat(...[...code]));
      }
      getCodeBuilder() {
        return new CodeBuilder(this);
      }
    };
    module2.exports = FunctionBuilder;
  }
});

// node_modules/wasmbuilder/src/modulebuilder.js
var require_modulebuilder = __commonJS({
  "node_modules/wasmbuilder/src/modulebuilder.js"(exports2, module2) {
    var FunctionBuilder = require_functionbuilder();
    var utils = require_utils();
    var ModuleBuilder = class {
      constructor() {
        this.functions = [];
        this.functionIdxByName = {};
        this.nImportFunctions = 0;
        this.nInternalFunctions = 0;
        this.memory = {
          pagesSize: 1,
          moduleName: "env",
          fieldName: "memory"
        };
        this.free = 8;
        this.datas = [];
        this.modules = {};
        this.exports = [];
      }
      build() {
        this._setSignatures();
        return new Uint8Array([
          ...utils.u32(1836278016),
          ...utils.u32(1),
          ...this._buildType(),
          ...this._buildImport(),
          ...this._buildFunctionDeclarations(),
          ...this._buildExports(),
          ...this._buildCode(),
          ...this._buildData()
        ]);
      }
      addFunction(fnName) {
        if (typeof this.functionIdxByName[fnName] !== "undefined")
          throw new Error(`Function already defined: ${fnName}`);
        const idx = this.functions.length;
        this.functionIdxByName[fnName] = idx;
        this.functions.push(new FunctionBuilder(this, fnName, "internal"));
        this.nInternalFunctions++;
        return this.functions[idx];
      }
      addIimportFunction(fnName, moduleName, _fieldName) {
        if (typeof this.functionIdxByName[fnName] !== "undefined")
          throw new Error(`Function already defined: ${fnName}`);
        if (this.functions.length > 0 && this.functions[this.functions.length - 1].type == "internal")
          throw new Error(`Import functions must be declared before internal: ${fnName}`);
        let fieldName = _fieldName || fnName;
        const idx = this.functions.length;
        this.functionIdxByName[fnName] = idx;
        this.functions.push(new FunctionBuilder(this, fnName, "import", moduleName, fieldName));
        this.nImportFunctions++;
        return this.functions[idx];
      }
      setMemory(pagesSize, moduleName, fieldName) {
        this.memory = {
          pagesSize,
          moduleName: moduleName || "env",
          fieldName: fieldName || "memory"
        };
      }
      exportFunction(fnName, _exportName) {
        const exportName = _exportName || fnName;
        if (typeof this.functionIdxByName[fnName] === "undefined")
          throw new Error(`Function not defined: ${fnName}`);
        const idx = this.functionIdxByName[fnName];
        if (exportName != fnName) {
          this.functionIdxByName[exportName] = idx;
        }
        this.exports.push({
          exportName,
          idx
        });
      }
      addData(offset, bytes) {
        this.datas.push({
          offset,
          bytes
        });
      }
      alloc(a, b) {
        let size;
        let bytes;
        if (Array.isArray(a) && typeof b === "undefined") {
          size = a.length;
          bytes = a;
        } else {
          size = a;
          bytes = b;
        }
        const p = this.free;
        this.free += size;
        if (bytes) {
          this.addData(p, bytes);
        }
        return p;
      }
      _setSignatures() {
        this.signatures = [];
        const signatureIdxByName = {};
        for (let i = 0; i < this.functions.length; i++) {
          const signature = this.functions[i].getSignature();
          const signatureName = "s_" + utils.toHexString(signature);
          if (typeof signatureIdxByName[signatureName] === "undefined") {
            signatureIdxByName[signatureName] = this.signatures.length;
            this.signatures.push(signature);
          }
          this.functions[i].signatureIdx = signatureIdxByName[signatureName];
        }
      }
      _buildSection(sectionType, section) {
        return [sectionType, ...utils.varuint32(section.length), ...section];
      }
      _buildType() {
        return this._buildSection(
          1,
          [
            ...utils.varuint32(this.signatures.length),
            ...[].concat(...this.signatures)
          ]
        );
      }
      _buildImport() {
        const entries = [];
        entries.push([
          ...utils.string(this.memory.moduleName),
          ...utils.string(this.memory.fieldName),
          2,
          0,
          //Flags no init valua
          ...utils.varuint32(this.memory.pagesSize)
        ]);
        for (let i = 0; i < this.nImportFunctions; i++) {
          entries.push([
            ...utils.string(this.functions[i].moduleName),
            ...utils.string(this.functions[i].fieldName),
            0,
            ...utils.varuint32(this.functions[i].signatureIdx)
          ]);
        }
        return this._buildSection(
          2,
          utils.varuint32(entries.length).concat(...entries)
        );
      }
      _buildFunctionDeclarations() {
        const entries = [];
        for (let i = this.nImportFunctions; i < this.nInternalFunctions; i++) {
          entries.push(...utils.varuint32(this.functions[i].signatureIdx));
        }
        return this._buildSection(
          3,
          [
            ...utils.varuint32(entries.length),
            ...[...entries]
          ]
        );
      }
      _buildExports() {
        const entries = [];
        for (let i = 0; i < this.exports.length; i++) {
          entries.push([
            ...utils.string(this.exports[i].exportName),
            0,
            ...utils.varuint32(this.exports[i].idx)
          ]);
        }
        return this._buildSection(
          7,
          utils.varuint32(entries.length).concat(...entries)
        );
      }
      _buildCode() {
        const entries = [];
        for (let i = this.nImportFunctions; i < this.nInternalFunctions; i++) {
          entries.push(this.functions[i].getBody());
        }
        return this._buildSection(
          10,
          utils.varuint32(entries.length).concat(...entries)
        );
      }
      _buildData() {
        const entries = [];
        entries.push([
          0,
          65,
          0,
          11,
          4,
          ...utils.u32(this.free)
        ]);
        for (let i = 0; i < this.datas.length; i++) {
          entries.push([
            0,
            65,
            ...utils.varint32(this.datas[i].offset),
            11,
            ...utils.varuint32(this.datas[i].bytes.length),
            ...this.datas[i].bytes
          ]);
        }
        return this._buildSection(
          11,
          utils.varuint32(entries.length).concat(...entries)
        );
      }
    };
    module2.exports = ModuleBuilder;
  }
});

// node_modules/wasmbuilder/index.js
var require_wasmbuilder = __commonJS({
  "node_modules/wasmbuilder/index.js"(exports2, module2) {
    module2.exports = require_modulebuilder();
  }
});

// node_modules/snarkjs/src/bigint.js
var require_bigint = __commonJS({
  "node_modules/snarkjs/src/bigint.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var wBigInt;
    if (typeof BigInt != "undefined") {
      wBigInt = BigInt;
      wBigInt.one = wBigInt(1);
      wBigInt.zero = wBigInt(0);
      wBigInt.genAffine = (q) => {
        const nq = -q;
        return (a) => {
          let aux = a;
          if (aux < 0) {
            if (aux <= nq) {
              aux = aux % q;
            }
            if (aux < wBigInt.zero) {
              aux = aux + q;
            }
          } else {
            if (aux >= q) {
              aux = aux % q;
            }
          }
          return aux.valueOf();
        };
      };
      wBigInt.genInverse = (q) => {
        return (a) => {
          let t2 = wBigInt.zero;
          let r = q;
          let newt = wBigInt.one;
          let newr = wBigInt.affine(a, q);
          while (newr != wBigInt.zero) {
            let q2 = r / newr;
            [t2, newt] = [newt, t2 - q2 * newt];
            [r, newr] = [newr, r - q2 * newr];
          }
          if (t2 < wBigInt.zero) t2 += q;
          return t2;
        };
      };
      wBigInt.genAdd = (q) => {
        if (q) {
          return (a, b) => (a + b) % q;
        } else {
          return (a, b) => a + b;
        }
      };
      wBigInt.genSub = (q) => {
        if (q) {
          return (a, b) => (a - b) % q;
        } else {
          return (a, b) => a - b;
        }
      };
      wBigInt.genNeg = (q) => {
        if (q) {
          return (a) => -a % q;
        } else {
          return (a) => -a;
        }
      };
      wBigInt.genMul = (q) => {
        if (q) {
          return (a, b) => a * b % q;
        } else {
          return (a, b) => a * b;
        }
      };
      wBigInt.genShr = () => {
        return (a, b) => a >> wBigInt(b);
      };
      wBigInt.genShl = (q) => {
        if (q) {
          return (a, b) => (a << wBigInt(b)) % q;
        } else {
          return (a, b) => a << wBigInt(b);
        }
      };
      wBigInt.genEquals = (q) => {
        if (q) {
          return (a, b) => a.affine(q) == b.affine(q);
        } else {
          return (a, b) => a == b;
        }
      };
      wBigInt.genSquare = (q) => {
        if (q) {
          return (a) => a * a % q;
        } else {
          return (a) => a * a;
        }
      };
      wBigInt.genDouble = (q) => {
        if (q) {
          return (a) => (a + a) % q;
        } else {
          return (a) => a + a;
        }
      };
      wBigInt.genIsZero = (q) => {
        if (q) {
          return (a) => a.affine(q) == wBigInt.zero;
        } else {
          return (a) => a == wBigInt.zero;
        }
      };
      wBigInt.prototype.isOdd = function() {
        return (this & wBigInt.one) == wBigInt(1);
      };
      wBigInt.prototype.isNegative = function() {
        return this < wBigInt.zero;
      };
      wBigInt.prototype.and = function(m) {
        return this & m;
      };
      wBigInt.prototype.div = function(c) {
        return this / c;
      };
      wBigInt.prototype.mod = function(c) {
        return this % c;
      };
      wBigInt.prototype.pow = function(c) {
        return this ** c;
      };
      wBigInt.prototype.abs = function() {
        return this > wBigInt.zero ? this : -this;
      };
      wBigInt.prototype.modPow = function(e, m) {
        let acc = wBigInt.one;
        let exp = this;
        let rem = e;
        while (rem) {
          if (rem & wBigInt.one) {
            acc = acc * exp % m;
          }
          exp = exp * exp % m;
          rem = rem >> wBigInt.one;
        }
        return acc;
      };
      wBigInt.prototype.greaterOrEquals = function(b) {
        return this >= b;
      };
      wBigInt.prototype.greater = function(b) {
        return this > b;
      };
      wBigInt.prototype.gt = wBigInt.prototype.greater;
      wBigInt.prototype.lesserOrEquals = function(b) {
        return this <= b;
      };
      wBigInt.prototype.lesser = function(b) {
        return this < b;
      };
      wBigInt.prototype.lt = wBigInt.prototype.lesser;
      wBigInt.prototype.equals = function(b) {
        return this == b;
      };
      wBigInt.prototype.eq = wBigInt.prototype.equals;
      wBigInt.prototype.neq = function(b) {
        return this != b;
      };
      wBigInt.prototype.toJSNumber = function() {
        return Number(this);
      };
    } else {
      oldProto = bigInt2.prototype;
      wBigInt = function(a) {
        if (typeof a == "string" && a.slice(0, 2) == "0x") {
          return bigInt2(a.slice(2), 16);
        } else {
          return bigInt2(a);
        }
      };
      wBigInt.one = bigInt2.one;
      wBigInt.zero = bigInt2.zero;
      wBigInt.prototype = oldProto;
      wBigInt.prototype.div = function(c) {
        return this.divide(c);
      };
      wBigInt.genAffine = (q) => {
        const nq = wBigInt.zero.minus(q);
        return (a) => {
          let aux = a;
          if (aux.isNegative()) {
            if (aux.lesserOrEquals(nq)) {
              aux = aux.mod(q);
            }
            if (aux.isNegative()) {
              aux = aux.add(q);
            }
          } else {
            if (aux.greaterOrEquals(q)) {
              aux = aux.mod(q);
            }
          }
          return aux;
        };
      };
      wBigInt.genInverse = (q) => {
        return (a) => a.affine(q).modInv(q);
      };
      wBigInt.genAdd = (q) => {
        if (q) {
          return (a, b) => {
            const r = a.add(b);
            return r.greaterOrEquals(q) ? r.minus(q) : r;
          };
        } else {
          return (a, b) => a.add(b);
        }
      };
      wBigInt.genSub = (q) => {
        if (q) {
          return (a, b) => a.greaterOrEquals(b) ? a.minus(b) : a.minus(b).add(q);
        } else {
          return (a, b) => a.minus(b);
        }
      };
      wBigInt.genNeg = (q) => {
        if (q) {
          return (a) => a.isZero() ? a : q.minus(a);
        } else {
          return (a) => wBigInt.zero.minus(a);
        }
      };
      wBigInt.genMul = (q) => {
        if (q) {
          return (a, b) => a.times(b).mod(q);
        } else {
          return (a, b) => a.times(b);
        }
      };
      wBigInt.genShr = () => {
        return (a, b) => a.shiftRight(wBigInt(b).value);
      };
      wBigInt.genShl = (q) => {
        if (q) {
          return (a, b) => a.shiftLeft(wBigInt(b).value).mod(q);
        } else {
          return (a, b) => a.shiftLeft(wBigInt(b).value);
        }
      };
      wBigInt.genSquare = (q) => {
        if (q) {
          return (a) => a.square().mod(q);
        } else {
          return (a) => a.square();
        }
      };
      wBigInt.genDouble = (q) => {
        if (q) {
          return (a) => a.add(a).mod(q);
        } else {
          return (a) => a.add(a);
        }
      };
      wBigInt.genEquals = (q) => {
        if (q) {
          return (a, b) => a.affine(q).equals(b.affine(q));
        } else {
          return (a, b) => a.equals(b);
        }
      };
      wBigInt.genIsZero = (q) => {
        if (q) {
          return (a) => a.affine(q).isZero();
        } else {
          return (a) => a.isZero();
        }
      };
    }
    var oldProto;
    wBigInt.affine = function(a, q) {
      return wBigInt.genAffine(q)(a);
    };
    wBigInt.prototype.affine = function(q) {
      return wBigInt.affine(this, q);
    };
    wBigInt.inverse = function(a, q) {
      return wBigInt.genInverse(q)(a);
    };
    wBigInt.prototype.inverse = function(q) {
      return wBigInt.genInverse(q)(this);
    };
    wBigInt.add = function(a, b, q) {
      return wBigInt.genAdd(q)(a, b);
    };
    wBigInt.prototype.add = function(a, q) {
      return wBigInt.genAdd(q)(this, a);
    };
    wBigInt.sub = function(a, b, q) {
      return wBigInt.genSub(q)(a, b);
    };
    wBigInt.prototype.sub = function(a, q) {
      return wBigInt.genSub(q)(this, a);
    };
    wBigInt.neg = function(a, q) {
      return wBigInt.genNeg(q)(a);
    };
    wBigInt.prototype.neg = function(q) {
      return wBigInt.genNeg(q)(this);
    };
    wBigInt.mul = function(a, b, q) {
      return wBigInt.genMul(q)(a, b);
    };
    wBigInt.prototype.mul = function(a, q) {
      return wBigInt.genMul(q)(this, a);
    };
    wBigInt.shr = function(a, b, q) {
      return wBigInt.genShr(q)(a, b);
    };
    wBigInt.prototype.shr = function(a, q) {
      return wBigInt.genShr(q)(this, a);
    };
    wBigInt.shl = function(a, b, q) {
      return wBigInt.genShl(q)(a, b);
    };
    wBigInt.prototype.shl = function(a, q) {
      return wBigInt.genShl(q)(this, a);
    };
    wBigInt.equals = function(a, b, q) {
      return wBigInt.genEquals(q)(a, b);
    };
    wBigInt.prototype.equals = function(a, q) {
      return wBigInt.genEquals(q)(this, a);
    };
    wBigInt.square = function(a, q) {
      return wBigInt.genSquare(q)(a);
    };
    wBigInt.prototype.square = function(q) {
      return wBigInt.genSquare(q)(this);
    };
    wBigInt.double = function(a, q) {
      return wBigInt.genDouble(q)(a);
    };
    wBigInt.prototype.double = function(q) {
      return wBigInt.genDouble(q)(this);
    };
    wBigInt.isZero = function(a, q) {
      return wBigInt.genIsZero(q)(a);
    };
    wBigInt.prototype.isZero = function(q) {
      return wBigInt.genIsZero(q)(this);
    };
    wBigInt.leBuff2int = function(buff) {
      let res = wBigInt.zero;
      for (let i = 0; i < buff.length; i++) {
        const n = wBigInt(buff[i]);
        res = res.add(n.shl(i * 8));
      }
      return res;
    };
    wBigInt.leInt2Buff = function(n, len) {
      let r = n;
      let o = 0;
      const buff = Buffer.alloc(len);
      while (r.greater(wBigInt.zero) && o < buff.length) {
        let c = Number(r.and(wBigInt("255")));
        buff[o] = c;
        o++;
        r = r.shr(8);
      }
      if (r.greater(wBigInt.zero)) throw new Error("Number does not feed in buffer");
      return buff;
    };
    wBigInt.prototype.leInt2Buff = function(len) {
      return wBigInt.leInt2Buff(this, len);
    };
    wBigInt.beBuff2int = function(buff) {
      let res = wBigInt.zero;
      for (let i = 0; i < buff.length; i++) {
        const n = wBigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i * 8));
      }
      return res;
    };
    wBigInt.beInt2Buff = function(n, len) {
      let r = n;
      let o = len - 1;
      const buff = Buffer.alloc(len);
      while (r.greater(wBigInt.zero) && o >= 0) {
        let c = Number(r.and(wBigInt("255")));
        buff[o] = c;
        o--;
        r = r.shr(8);
      }
      if (r.greater(wBigInt.zero)) throw new Error("Number does not feed in buffer");
      return buff;
    };
    wBigInt.prototype.beInt2Buff = function(len) {
      return wBigInt.beInt2Buff(this, len);
    };
    module2.exports = wBigInt;
  }
});

// node_modules/snarkjs/src/calculateWitness.js
var require_calculateWitness = __commonJS({
  "node_modules/snarkjs/src/calculateWitness.js"(exports2, module2) {
    var bigInt2 = require_bigint();
    module2.exports = calculateWitness2;
    function calculateWitness2(circuit, inputSignals, options) {
      options = options || {};
      if (!options.logFunction) options.logFunction = console.log;
      const ctx = new RTCtx(circuit, options);
      function iterateSelector(values, sels, cb) {
        if (!Array.isArray(values)) {
          return cb(sels, values);
        }
        for (let i = 0; i < values.length; i++) {
          sels.push(i);
          iterateSelector(values[i], sels, cb);
          sels.pop(i);
        }
      }
      ctx.setSignal("one", [], bigInt2(1));
      for (let c in ctx.notInitSignals) {
        if (ctx.notInitSignals[c] == 0) ctx.triggerComponent(c);
      }
      for (let s in inputSignals) {
        ctx.currentComponent = "main";
        iterateSelector(inputSignals[s], [], function(selector, value) {
          if (typeof value == "undefined") throw new Error("Signal not defined:" + s);
          ctx.setSignal(s, selector, bigInt2(value));
        });
      }
      for (let i = 0; i < circuit.nInputs; i++) {
        const idx = circuit.inputIdx(i);
        if (typeof ctx.witness[idx] == "undefined") {
          throw new Error("Input Signal not assigned: " + circuit.signalNames(idx));
        }
      }
      for (let i = 0; i < ctx.witness.length; i++) {
        if (typeof ctx.witness[i] == "undefined") {
          throw new Error("Signal not assigned: " + circuit.signalNames(i));
        }
        if (options.logOutput) options.logFunction(circuit.signalNames(i) + " --> " + ctx.witness[i].toString());
      }
      return ctx.witness.slice(0, circuit.nVars);
    }
    var RTCtx = class {
      constructor(circuit, options) {
        this.options = options;
        this.scopes = [];
        this.circuit = circuit;
        this.witness = new Array(circuit.nSignals);
        this.notInitSignals = {};
        for (let c in this.circuit.components) {
          this.notInitSignals[c] = this.circuit.components[c].inputSignals;
        }
      }
      _sels2str(sels) {
        let res = "";
        for (let i = 0; i < sels.length; i++) {
          res += `[${sels[i]}]`;
        }
        return res;
      }
      setPin(componentName, componentSels, signalName, signalSels, value) {
        let fullName = componentName == "one" ? "one" : this.currentComponent + "." + componentName;
        fullName += this._sels2str(componentSels) + "." + signalName + this._sels2str(signalSels);
        this.setSignalFullName(fullName, value);
      }
      setSignal(name, sels, value) {
        let fullName = this.currentComponent ? this.currentComponent + "." + name : name;
        fullName += this._sels2str(sels);
        this.setSignalFullName(fullName, value);
      }
      triggerComponent(c) {
        if (this.options.logTrigger) this.options.logFunction("Component Treiggered: " + this.circuit.components[c].name);
        this.notInitSignals[c]--;
        const oldComponent = this.currentComponent;
        this.currentComponent = this.circuit.components[c].name;
        const template = this.circuit.components[c].template;
        const newScope = {};
        for (let p in this.circuit.components[c].params) {
          newScope[p] = this.circuit.components[c].params[p];
        }
        const oldScope = this.scopes;
        this.scopes = [this.scopes[0], newScope];
        this.circuit.templates[template](this);
        this.scopes = oldScope;
        this.currentComponent = oldComponent;
        if (this.options.logTrigger) this.options.logFunction("End Component Treiggered: " + this.circuit.components[c].name);
      }
      callFunction(functionName, params) {
        const newScope = {};
        for (let p = 0; p < this.circuit.functions[functionName].params.length; p++) {
          const paramName = this.circuit.functions[functionName].params[p];
          newScope[paramName] = params[p];
        }
        const oldScope = this.scopes;
        this.scopes = [this.scopes[0], newScope];
        const res = this.circuit.functions[functionName].func(this);
        this.scopes = oldScope;
        return res;
      }
      setSignalFullName(fullName, value) {
        if (this.options.logSet) this.options.logFunction("set " + fullName + " <-- " + value.toString());
        const sId = this.circuit.getSignalIdx(fullName);
        let firstInit = false;
        if (typeof this.witness[sId] == "undefined") {
          firstInit = true;
        }
        this.witness[sId] = bigInt2(value);
        const callComponents = [];
        for (let i = 0; i < this.circuit.signals[sId].triggerComponents.length; i++) {
          var idCmp = this.circuit.signals[sId].triggerComponents[i];
          if (firstInit) this.notInitSignals[idCmp]--;
          callComponents.push(idCmp);
        }
        callComponents.map((c) => {
          if (this.notInitSignals[c] == 0) this.triggerComponent(c);
        });
        return this.witness[sId];
      }
      setVar(name, sels, value) {
        function setVarArray(a, sels2, value2) {
          if (sels2.length == 1) {
            a[sels2[0]] = value2;
          } else {
            if (typeof a[sels2[0]] == "undefined") a[sels2[0]] = [];
            setVarArray(a[sels2[0]], sels2.slice(1), value2);
          }
        }
        const scope = this.scopes[this.scopes.length - 1];
        if (sels.length == 0) {
          scope[name] = value;
        } else {
          if (typeof scope[name] == "undefined") scope[name] = [];
          setVarArray(scope[name], sels, value);
        }
        return value;
      }
      getVar(name, sels) {
        function select(a, sels2) {
          return sels2.length == 0 ? a : select(a[sels2[0]], sels2.slice(1));
        }
        for (let i = this.scopes.length - 1; i >= 0; i--) {
          if (typeof this.scopes[i][name] != "undefined") return select(this.scopes[i][name], sels);
        }
        throw new Error("Variable not defined: " + name);
      }
      getSignal(name, sels) {
        let fullName = name == "one" ? "one" : this.currentComponent + "." + name;
        fullName += this._sels2str(sels);
        return this.getSignalFullName(fullName);
      }
      getPin(componentName, componentSels, signalName, signalSels) {
        let fullName = componentName == "one" ? "one" : this.currentComponent + "." + componentName;
        fullName += this._sels2str(componentSels) + "." + signalName + this._sels2str(signalSels);
        return this.getSignalFullName(fullName);
      }
      getSignalFullName(fullName) {
        const sId = this.circuit.getSignalIdx(fullName);
        if (typeof this.witness[sId] == "undefined") {
          throw new Error("Signal not initialized: " + fullName);
        }
        if (this.options.logGet) this.options.logFunction("get --->" + fullName + " = " + this.witness[sId].toString());
        return this.witness[sId];
      }
      assert(a, b, errStr) {
        const ba = bigInt2(a);
        const bb = bigInt2(b);
        if (!ba.equals(bb)) {
          throw new Error("Constraint doesn't match " + this.currentComponent + ": " + errStr + " -> " + ba.toString() + " != " + bb.toString());
        }
      }
    };
  }
});

// node_modules/snarkjs/src/circuit.js
var require_circuit = __commonJS({
  "node_modules/snarkjs/src/circuit.js"(exports, module) {
    var bigInt = require_bigint();
    var __P__ = bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    var __MASK__ = bigInt("28948022309329048855892746252171976963317496166410141009864396001978282409983");
    var calculateWitness = require_calculateWitness();
    module.exports = class Circuit {
      constructor(circuitDef) {
        this.nPubInputs = circuitDef.nPubInputs;
        this.nPrvInputs = circuitDef.nPrvInputs;
        this.nInputs = circuitDef.nInputs;
        this.nOutputs = circuitDef.nOutputs;
        this.nVars = circuitDef.nVars;
        this.nSignals = circuitDef.nSignals;
        this.nConstants = circuitDef.nConstants;
        this.nConstraints = circuitDef.constraints.length;
        this.signalName2Idx = circuitDef.signalName2Idx;
        this.components = circuitDef.components;
        this.componentName2Idx = circuitDef.componentName2Idx;
        this.signals = circuitDef.signals;
        this.constraints = circuitDef.constraints;
        this.templates = {};
        for (let t in circuitDef.templates) {
          this.templates[t] = eval(" const __f= " + circuitDef.templates[t] + "\n__f");
        }
        this.functions = {};
        for (let f in circuitDef.functions) {
          this.functions[f] = {
            params: circuitDef.functions[f].params,
            func: eval(" const __f= " + circuitDef.functions[f].func + "\n__f;")
          };
        }
      }
      calculateWitness(input, log) {
        return calculateWitness(this, input, log);
      }
      checkWitness(w) {
        const evalLC = (lc, w2) => {
          let acc = bigInt(0);
          for (let k in lc) {
            acc = acc.add(bigInt(w2[k]).mul(bigInt(lc[k]))).mod(__P__);
          }
          return acc;
        };
        const checkConstraint = (ct, w2) => {
          const a = evalLC(ct[0], w2);
          const b = evalLC(ct[1], w2);
          const c = evalLC(ct[2], w2);
          const res = a.mul(b).sub(c).affine(__P__);
          if (!res.isZero()) return false;
          return true;
        };
        for (let i = 0; i < this.constraints.length; i++) {
          if (!checkConstraint(this.constraints[i], w)) {
            this.printCostraint(this.constraints[i]);
            return false;
          }
        }
        return true;
      }
      printCostraint(c) {
        const lc2str = (lc) => {
          let S2 = "";
          for (let k in lc) {
            let name = this.signals[k].names[0];
            if (name == "one") name = "";
            let v = bigInt(lc[k]);
            let vs;
            if (!v.lesserOrEquals(__P__.shr(bigInt(1)))) {
              v = __P__.sub(v);
              vs = "-" + v.toString();
            } else {
              if (S2 != "") {
                vs = "+" + v.toString();
              } else {
                vs = "";
              }
              if (vs != "1") {
                vs = vs + v.toString();
                ;
              }
            }
            S2 = S2 + " " + vs + name;
          }
          return S2;
        };
        const S = `[ ${lc2str(c[0])} ] * [ ${lc2str(c[1])} ] - [ ${lc2str(c[2])} ] = 0`;
        console.log(S);
      }
      printConstraints() {
        for (let i = 0; i < this.constraints.length; i++) {
          this.printCostraint(this.constraints[i]);
        }
      }
      getSignalIdx(name) {
        if (typeof this.signalName2Idx[name] != "undefined") return this.signalName2Idx[name];
        if (!isNaN(name)) return Number(name);
        throw new Error("Invalid signal identifier: " + name);
      }
      // returns the index of the i'th output
      outputIdx(i) {
        if (i >= this.nOutputs) throw new Error("Accessing an invalid output: " + i);
        return i + 1;
      }
      // returns the index of the i'th input
      inputIdx(i) {
        if (i >= this.nInputs) throw new Error("Accessing an invalid input: " + i);
        return this.nOutputs + 1 + i;
      }
      // returns the index of the i'th public input
      pubInputIdx(i) {
        if (i >= this.nPubInputs) throw new Error("Accessing an invalid pubInput: " + i);
        return this.inputIdx(i);
      }
      // returns the index of the i'th private input
      prvInputIdx(i) {
        if (i >= this.nPrvInputs) throw new Error("Accessing an invalid prvInput: " + i);
        return this.inputIdx(this.nPubInputs + i);
      }
      // returns the index of the i'th variable
      varIdx(i) {
        if (i >= this.nVars) throw new Error("Accessing an invalid variable: " + i);
        return i;
      }
      // returns the index of the i'th constant
      constantIdx(i) {
        if (i >= this.nConstants) throw new Error("Accessing an invalid constant: " + i);
        return this.nVars + i;
      }
      // returns the index of the i'th signal
      signalIdx(i) {
        if (i >= this.nSignls) throw new Error("Accessing an invalid signal: " + i);
        return i;
      }
      signalNames(i) {
        return this.signals[this.getSignalIdx(i)].names.join(", ");
      }
      a(constraint, signalIdx) {
        return bigInt(this.constraints[constraint][0][signalIdx] || 0);
      }
      b(constraint, signalIdx) {
        return bigInt(this.constraints[constraint][1][signalIdx] || 0);
      }
      c(constraint, signalIdx) {
        return bigInt(this.constraints[constraint][2][signalIdx] || 0);
      }
    };
  }
});

// tools/stringifybigint.js
var require_stringifybigint = __commonJS({
  "tools/stringifybigint.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    module2.exports.stringifyBigInts = stringifyBigInts;
    module2.exports.unstringifyBigInts = unstringifyBigInts;
    module2.exports.hexifyBigInts = hexifyBigInts;
    module2.exports.unhexifyBigInts = unhexifyBigInts;
    function stringifyBigInts(o) {
      if (typeof o == "bigint" || o instanceof bigInt2) {
        return o.toString(10);
      } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
      } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
          res[k] = stringifyBigInts(o[k]);
        }
        return res;
      } else {
        return o;
      }
    }
    function unstringifyBigInts(o) {
      if (typeof o == "string" && /^[0-9]+$/.test(o)) {
        return bigInt2(o);
      } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
      } else if (typeof o == "object" && !(o instanceof bigInt2)) {
        const res = {};
        for (let k in o) {
          res[k] = unstringifyBigInts(o[k]);
        }
        return res;
      } else {
        return o;
      }
    }
    function hexifyBigInts(o) {
      if (typeof o === "bigint" || o instanceof bigInt2) {
        let str = o.toString(16);
        while (str.length < 64) str = "0" + str;
        str = "0x" + str;
        return str;
      } else if (Array.isArray(o)) {
        return o.map(hexifyBigInts);
      } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
          res[k] = hexifyBigInts(o[k]);
        }
        return res;
      } else {
        return o;
      }
    }
    function unhexifyBigInts(o) {
      if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
        return bigInt2(o);
      } else if (Array.isArray(o)) {
        return o.map(unhexifyBigInts);
      } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
          res[k] = unhexifyBigInts(o[k]);
        }
        return res;
      } else {
        return o;
      }
    }
  }
});

// node_modules/snarkjs/src/stringifybigint.js
var require_stringifybigint2 = __commonJS({
  "node_modules/snarkjs/src/stringifybigint.js"(exports2, module2) {
    var bigInt2 = require_bigint();
    module2.exports.stringifyBigInts = stringifyBigInts;
    module2.exports.unstringifyBigInts = unstringifyBigInts;
    function stringifyBigInts(o) {
      if (typeof o == "bigint" || o.isZero !== void 0) {
        return o.toString(10);
      } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
      } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
          res[k] = stringifyBigInts(o[k]);
        }
        return res;
      } else {
        return o;
      }
    }
    function unstringifyBigInts(o) {
      if (typeof o == "string" && /^[0-9]+$/.test(o)) {
        return bigInt2(o);
      } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
      } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
          res[k] = unstringifyBigInts(o[k]);
        }
        return res;
      } else {
        return o;
      }
    }
  }
});

// src/utils.js
var require_utils2 = __commonJS({
  "src/utils.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var Circuit = require_circuit();
    var bigInt22 = require_bigint();
    var hexifyBigInts = require_stringifybigint().hexifyBigInts;
    var unhexifyBigInts = require_stringifybigint().unhexifyBigInts;
    var stringifyBigInts = require_stringifybigint().stringifyBigInts;
    var unstringifyBigInts = require_stringifybigint().unstringifyBigInts;
    var stringifyBigInts2 = require_stringifybigint2().stringifyBigInts;
    var unstringifyBigInts2 = require_stringifybigint2().unstringifyBigInts;
    function bigInt2BytesLE(_a, len) {
      const b = Array(len);
      let v = bigInt2(_a);
      for (let i = 0; i < len; i++) {
        b[i] = v.and(255).toJSNumber();
        v = v.shiftRight(8);
      }
      return b;
    }
    function bigInt2U32LE(_a, len) {
      const b = Array(len);
      let v = bigInt2(_a);
      for (let i = 0; i < len; i++) {
        b[i] = v.and(4294967295).toJSNumber();
        v = v.shiftRight(32);
      }
      return b;
    }
    function convertWitness(witness) {
      const buffLen = witness.length * 32;
      const buff = new ArrayBuffer(buffLen);
      const h = {
        dataView: new DataView(buff),
        offset: 0
      };
      const mask = bigInt22(4294967295);
      for (let i = 0; i < witness.length; i++) {
        for (let j = 0; j < 8; j++) {
          const v = Number(witness[i].shr(j * 32).and(mask));
          h.dataView.setUint32(h.offset, v, true);
          h.offset += 4;
        }
      }
      return buff;
    }
    function toHex32(number) {
      let str = number.toString(16);
      while (str.length < 64) str = "0" + str;
      return str;
    }
    function toSolidityInput(proof) {
      const flatProof = unstringifyBigInts([
        proof.pi_a[0],
        proof.pi_a[1],
        proof.pi_b[0][1],
        proof.pi_b[0][0],
        proof.pi_b[1][1],
        proof.pi_b[1][0],
        proof.pi_c[0],
        proof.pi_c[1]
      ]);
      const result = {
        proof: "0x" + flatProof.map((x) => toHex32(x)).join("")
      };
      if (proof.publicSignals) {
        result.publicSignals = hexifyBigInts(unstringifyBigInts(proof.publicSignals));
      }
      return result;
    }
    function genWitness(input, circuitJson) {
      const circuit = new Circuit(unstringifyBigInts2(circuitJson));
      const witness = circuit.calculateWitness(unstringifyBigInts2(input));
      const publicSignals = witness.slice(1, circuit.nPubInputs + circuit.nOutputs + 1);
      return { witness, publicSignals };
    }
    async function genWitnessAndProve(groth16, input, circuitJson, provingKey) {
      const witnessData = genWitness(input, circuitJson);
      const witnessBin = convertWitness(witnessData.witness);
      const result = await groth16.proof(witnessBin, provingKey);
      result.publicSignals = stringifyBigInts2(witnessData.publicSignals);
      return result;
    }
    module2.exports = { bigInt2BytesLE, bigInt2U32LE, toSolidityInput, genWitnessAndProve };
  }
});

// src/build_int.js
var require_build_int = __commonJS({
  "src/build_int.js"(exports2, module2) {
    var utils = require_utils2();
    module2.exports = function buildInt(module3, n64, _prefix) {
      const prefix = _prefix || "int";
      if (module3.modules[prefix]) return prefix;
      module3.modules[prefix] = {};
      const n32 = n64 * 2;
      const n8 = n64 * 8;
      const one = module3.alloc(n8, utils.bigInt2BytesLE(1, n8));
      function buildCopy() {
        const f2 = module3.addFunction(prefix + "_copy");
        f2.addParam("px", "i32");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        for (let i = 0; i < n64; i++) {
          f2.addCode(
            c.i64_store(
              c.getLocal("pr"),
              i * 8,
              c.i64_load(
                c.getLocal("px"),
                i * 8
              )
            )
          );
        }
      }
      function buildZero() {
        const f2 = module3.addFunction(prefix + "_zero");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        for (let i = 0; i < n64; i++) {
          f2.addCode(
            c.i64_store(
              c.getLocal("pr"),
              i * 8,
              c.i64_const(0)
            )
          );
        }
      }
      function buildOne() {
        const f2 = module3.addFunction(prefix + "_one");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.i64_store(
            c.getLocal("pr"),
            0,
            c.i64_const(1)
          )
        );
        for (let i = 1; i < n64; i++) {
          f2.addCode(
            c.i64_store(
              c.getLocal("pr"),
              i * 8,
              c.i64_const(0)
            )
          );
        }
      }
      function buildIsZero() {
        const f2 = module3.addFunction(prefix + "_isZero");
        f2.addParam("px", "i32");
        f2.setReturnType("i32");
        const c = f2.getCodeBuilder();
        function getCompCode(n) {
          if (n == 0) {
            return c.ret(c.i64_eqz(
              c.i64_load(c.getLocal("px"))
            ));
          }
          return c.if(
            c.i64_eqz(
              c.i64_load(c.getLocal("px"), n * 8)
            ),
            getCompCode(n - 1),
            c.ret(c.i32_const(0))
          );
        }
        f2.addCode(getCompCode(n64 - 1));
        f2.addCode(c.ret(c.i32_const(0)));
      }
      function buildEq() {
        const f2 = module3.addFunction(prefix + "_eq");
        f2.addParam("px", "i32");
        f2.addParam("py", "i32");
        f2.setReturnType("i32");
        const c = f2.getCodeBuilder();
        function getCompCode(n) {
          if (n == 0) {
            return c.ret(c.i64_eq(
              c.i64_load(c.getLocal("px")),
              c.i64_load(c.getLocal("py"))
            ));
          }
          return c.if(
            c.i64_eq(
              c.i64_load(c.getLocal("px"), n * 8),
              c.i64_load(c.getLocal("py"), n * 8)
            ),
            getCompCode(n - 1),
            c.ret(c.i32_const(0))
          );
        }
        f2.addCode(getCompCode(n64 - 1));
        f2.addCode(c.ret(c.i32_const(0)));
      }
      function buildGte() {
        const f2 = module3.addFunction(prefix + "_gte");
        f2.addParam("px", "i32");
        f2.addParam("py", "i32");
        f2.setReturnType("i32");
        const c = f2.getCodeBuilder();
        function getCompCode(n) {
          if (n == 0) {
            return c.ret(c.i64_ge_u(
              c.i64_load(c.getLocal("px")),
              c.i64_load(c.getLocal("py"))
            ));
          }
          return c.if(
            c.i64_lt_u(
              c.i64_load(c.getLocal("px"), n * 8),
              c.i64_load(c.getLocal("py"), n * 8)
            ),
            c.ret(c.i32_const(0)),
            c.if(
              c.i64_gt_u(
                c.i64_load(c.getLocal("px"), n * 8),
                c.i64_load(c.getLocal("py"), n * 8)
              ),
              c.ret(c.i32_const(1)),
              getCompCode(n - 1)
            )
          );
        }
        f2.addCode(getCompCode(n64 - 1));
        f2.addCode(c.ret(c.i32_const(0)));
      }
      function buildAdd() {
        const f2 = module3.addFunction(prefix + "_add");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        f2.setReturnType("i32");
        f2.addLocal("c", "i64");
        const c = f2.getCodeBuilder();
        f2.addCode(c.setLocal(
          "c",
          c.i64_add(
            c.i64_load32_u(c.getLocal("x")),
            c.i64_load32_u(c.getLocal("y"))
          )
        ));
        f2.addCode(c.i64_store32(
          c.getLocal("r"),
          c.getLocal("c")
        ));
        for (let i = 1; i < n32; i++) {
          f2.addCode(c.setLocal(
            "c",
            c.i64_add(
              c.i64_add(
                c.i64_load32_u(c.getLocal("x"), 4 * i),
                c.i64_load32_u(c.getLocal("y"), 4 * i)
              ),
              c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
            )
          ));
          f2.addCode(c.i64_store32(
            c.getLocal("r"),
            i * 4,
            c.getLocal("c")
          ));
        }
        f2.addCode(c.i32_wrap_i64(c.i64_shr_u(c.getLocal("c"), c.i64_const(32))));
      }
      function buildSub() {
        const f2 = module3.addFunction(prefix + "_sub");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        f2.setReturnType("i32");
        f2.addLocal("c", "i64");
        const c = f2.getCodeBuilder();
        f2.addCode(c.setLocal(
          "c",
          c.i64_sub(
            c.i64_load32_u(c.getLocal("x")),
            c.i64_load32_u(c.getLocal("y"))
          )
        ));
        f2.addCode(c.i64_store32(
          c.getLocal("r"),
          c.i64_and(
            c.getLocal("c"),
            c.i64_const("0xFFFFFFFF")
          )
        ));
        for (let i = 1; i < n32; i++) {
          f2.addCode(c.setLocal(
            "c",
            c.i64_add(
              c.i64_sub(
                c.i64_load32_u(c.getLocal("x"), 4 * i),
                c.i64_load32_u(c.getLocal("y"), 4 * i)
              ),
              c.i64_shr_s(c.getLocal("c"), c.i64_const(32))
            )
          ));
          f2.addCode(c.i64_store32(
            c.getLocal("r"),
            i * 4,
            c.i64_and(c.getLocal("c"), c.i64_const("0xFFFFFFFF"))
          ));
        }
        f2.addCode(c.i32_wrap_i64(c.i64_shr_s(c.getLocal("c"), c.i64_const(32))));
      }
      function buildMul() {
        const f2 = module3.addFunction(prefix + "_mul");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        f2.addLocal("c0", "i64");
        f2.addLocal("c1", "i64");
        for (let i = 0; i < n32; i++) {
          f2.addLocal("x" + i, "i64");
          f2.addLocal("y" + i, "i64");
        }
        const c = f2.getCodeBuilder();
        const loadX = [];
        const loadY = [];
        function mulij(i, j) {
          let X, Y;
          if (!loadX[i]) {
            X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
            loadX[i] = true;
          } else {
            X = c.getLocal("x" + i);
          }
          if (!loadY[j]) {
            Y = c.teeLocal("y" + j, c.i64_load32_u(c.getLocal("y"), j * 4));
            loadY[j] = true;
          } else {
            Y = c.getLocal("y" + j);
          }
          return c.i64_mul(X, Y);
        }
        let c0 = "c0";
        let c1 = "c1";
        for (let k = 0; k < n32 * 2 - 1; k++) {
          for (let i = Math.max(0, k - n32 + 1); i <= k && i < n32; i++) {
            const j = k - i;
            f2.addCode(
              c.setLocal(
                c0,
                c.i64_add(
                  c.i64_and(
                    c.getLocal(c0),
                    c.i64_const(4294967295)
                  ),
                  mulij(i, j)
                )
              )
            );
            f2.addCode(
              c.setLocal(
                c1,
                c.i64_add(
                  c.getLocal(c1),
                  c.i64_shr_u(
                    c.getLocal(c0),
                    c.i64_const(32)
                  )
                )
              )
            );
          }
          f2.addCode(
            c.i64_store32(
              c.getLocal("r"),
              k * 4,
              c.getLocal(c0)
            )
          );
          [c0, c1] = [c1, c0];
          f2.addCode(
            c.setLocal(
              c1,
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          );
        }
        f2.addCode(
          c.i64_store32(
            c.getLocal("r"),
            n32 * 4 * 2 - 4,
            c.getLocal(c0)
          )
        );
      }
      function buildMulOld() {
        const mulBuff = module3.alloc(n32 * n32 * 8);
        const f2 = module3.addFunction(prefix + "_mulOld");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        f2.addLocal("c", "i64");
        const c = f2.getCodeBuilder();
        for (let i = 0; i < n32; i++) {
          for (let j = 0; j < n32; j++) {
            f2.addCode(c.i64_store(
              c.i32_const(mulBuff),
              (i * n32 + j) * 8,
              c.i64_mul(
                c.i64_load32_u(c.getLocal("x"), i * 4),
                c.i64_load32_u(c.getLocal("y"), j * 4)
              )
            ));
          }
        }
        for (let i = 0; i < n32; i++) {
          f2.addCode(c.i64_shr_u(c.getLocal("c"), c.i64_const(32)));
          for (let j = 0; j < i; j++) {
            f2.addCode(c.i64_add(
              [],
              c.i64_load32_u(
                c.i32_const(mulBuff),
                j * (n32 * 8) + i * 8 - 4 - j * 8
              )
            ));
          }
          for (let j = 0; j < i + 1; j++) {
            f2.addCode(c.i64_add(
              [],
              c.i64_load32_u(
                c.i32_const(mulBuff),
                j * (n32 * 8) + i * 8 - j * 8
              )
            ));
          }
          f2.addCode(c.setLocal("c", []));
          f2.addCode(
            c.i64_store32(
              c.getLocal("r"),
              i * 4,
              c.getLocal("c")
            )
          );
        }
        for (let i = 0; i < n32; i++) {
          f2.addCode(c.i64_shr_u(c.getLocal("c"), c.i64_const(32)));
          for (let j = i; j < n32; j++) {
            f2.addCode(c.i64_add(
              [],
              c.i64_load32_u(
                c.i32_const(mulBuff),
                j * (n32 * 8) + n32 * 8 - 4 + i * 8 - j * 8
              )
            ));
          }
          for (let j = i + 1; j < n32; j++) {
            f2.addCode(c.i64_add(
              [],
              c.i64_load32_u(
                c.i32_const(mulBuff),
                j * (n32 * 8) + n32 * 8 + i * 8 - j * 8
              )
            ));
          }
          f2.addCode(c.setLocal("c", []));
          f2.addCode(
            c.i64_store32(
              c.getLocal("r"),
              i * 4 + n32 * 4,
              c.getLocal("c")
            )
          );
        }
      }
      function _buildMul1() {
        const f2 = module3.addFunction(prefix + "__mul1");
        f2.addParam("px", "i32");
        f2.addParam("y", "i64");
        f2.addParam("pr", "i32");
        f2.addLocal("c", "i64");
        const c = f2.getCodeBuilder();
        f2.addCode(c.setLocal(
          "c",
          c.i64_mul(
            c.i64_load32_u(c.getLocal("px"), 0, 0),
            c.getLocal("y")
          )
        ));
        f2.addCode(c.i64_store32(
          c.getLocal("pr"),
          0,
          0,
          c.getLocal("c")
        ));
        for (let i = 1; i < n32; i++) {
          f2.addCode(c.setLocal(
            "c",
            c.i64_add(
              c.i64_mul(
                c.i64_load32_u(c.getLocal("px"), 4 * i, 0),
                c.getLocal("y")
              ),
              c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
            )
          ));
          f2.addCode(c.i64_store32(
            c.getLocal("pr"),
            i * 4,
            0,
            c.getLocal("c")
          ));
        }
      }
      function _buildAdd1() {
        const f2 = module3.addFunction(prefix + "__add1");
        f2.addParam("x", "i32");
        f2.addParam("y", "i64");
        f2.addLocal("c", "i64");
        f2.addLocal("px", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.setLocal("px", c.getLocal("x")));
        f2.addCode(c.setLocal(
          "c",
          c.i64_add(
            c.i64_load32_u(c.getLocal("px"), 0, 0),
            c.getLocal("y")
          )
        ));
        f2.addCode(c.i64_store32(
          c.getLocal("px"),
          0,
          0,
          c.getLocal("c")
        ));
        f2.addCode(c.setLocal(
          "c",
          c.i64_shr_u(
            c.getLocal("c"),
            c.i64_const(32)
          )
        ));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i64_eqz(c.getLocal("c"))
          ),
          c.setLocal(
            "px",
            c.i32_add(
              c.getLocal("px"),
              c.i32_const(4)
            )
          ),
          c.setLocal(
            "c",
            c.i64_add(
              c.i64_load32_u(c.getLocal("px"), 0, 0),
              c.getLocal("c")
            )
          ),
          c.i64_store32(
            c.getLocal("px"),
            0,
            0,
            c.getLocal("c")
          ),
          c.setLocal(
            "c",
            c.i64_shr_u(
              c.getLocal("c"),
              c.i64_const(32)
            )
          ),
          c.br(0)
        )));
      }
      function buildDiv() {
        _buildMul1();
        _buildAdd1();
        const f2 = module3.addFunction(prefix + "_div");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("c", "i32");
        f2.addParam("r", "i32");
        f2.addLocal("rr", "i32");
        f2.addLocal("cc", "i32");
        f2.addLocal("eX", "i32");
        f2.addLocal("eY", "i32");
        f2.addLocal("sy", "i64");
        f2.addLocal("sx", "i64");
        f2.addLocal("ec", "i32");
        const c = f2.getCodeBuilder();
        const Y = c.i32_const(module3.alloc(n8));
        const Caux = c.i32_const(module3.alloc(n8));
        const Raux = c.i32_const(module3.alloc(n8));
        const C = c.getLocal("cc");
        const R = c.getLocal("rr");
        const pr1 = module3.alloc(n8 * 2);
        const R1 = c.i32_const(pr1);
        const R2 = c.i32_const(pr1 + n8);
        f2.addCode(c.if(
          c.getLocal("c"),
          c.setLocal("cc", c.getLocal("c")),
          c.setLocal("cc", Caux)
        ));
        f2.addCode(c.if(
          c.getLocal("r"),
          c.setLocal("rr", c.getLocal("r")),
          c.setLocal("rr", Raux)
        ));
        f2.addCode(c.call(prefix + "_copy", c.getLocal("x"), R));
        f2.addCode(c.call(prefix + "_copy", c.getLocal("y"), Y));
        f2.addCode(c.call(prefix + "_zero", C));
        f2.addCode(c.call(prefix + "_zero", R1));
        f2.addCode(c.setLocal("eX", c.i32_const(n8 - 1)));
        f2.addCode(c.setLocal("eY", c.i32_const(n8 - 1)));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_or(
              c.i32_load8_u(
                c.i32_add(Y, c.getLocal("eY")),
                0,
                0
              ),
              c.i32_eq(
                c.getLocal("eY"),
                c.i32_const(3)
              )
            )
          ),
          c.setLocal("eY", c.i32_sub(c.getLocal("eY"), c.i32_const(1))),
          c.br(0)
        )));
        f2.addCode(
          c.setLocal(
            "sy",
            c.i64_add(
              c.i64_load32_u(
                c.i32_sub(
                  c.i32_add(Y, c.getLocal("eY")),
                  c.i32_const(3)
                ),
                0,
                0
              ),
              c.i64_const(1)
            )
          )
        );
        f2.addCode(
          c.if(
            c.i64_eq(
              c.getLocal("sy"),
              c.i64_const(1)
            ),
            c.drop(c.i64_div_u(c.i64_const(0), c.i64_const(0)))
          )
        );
        f2.addCode(c.block(c.loop(
          // while (eX>7)&&(Y[eX]==0) ex--;
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_or(
                c.i32_load8_u(
                  c.i32_add(R, c.getLocal("eX")),
                  0,
                  0
                ),
                c.i32_eq(
                  c.getLocal("eX"),
                  c.i32_const(7)
                )
              )
            ),
            c.setLocal("eX", c.i32_sub(c.getLocal("eX"), c.i32_const(1))),
            c.br(0)
          )),
          c.setLocal(
            "sx",
            c.i64_load(
              c.i32_sub(
                c.i32_add(R, c.getLocal("eX")),
                c.i32_const(7)
              ),
              0,
              0
            )
          ),
          c.setLocal(
            "sx",
            c.i64_div_u(
              c.getLocal("sx"),
              c.getLocal("sy")
            )
          ),
          c.setLocal(
            "ec",
            c.i32_sub(
              c.i32_sub(
                c.getLocal("eX"),
                c.getLocal("eY")
              ),
              c.i32_const(4)
            )
          ),
          // While greater than 32 bits or ec is neg, shr and inc exp
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_and(
                c.i64_eqz(
                  c.i64_and(
                    c.getLocal("sx"),
                    c.i64_const("0xFFFFFFFF00000000")
                  )
                ),
                c.i32_ge_s(
                  c.getLocal("ec"),
                  c.i32_const(0)
                )
              )
            ),
            c.setLocal(
              "sx",
              c.i64_shr_u(
                c.getLocal("sx"),
                c.i64_const(8)
              )
            ),
            c.setLocal(
              "ec",
              c.i32_add(
                c.getLocal("ec"),
                c.i32_const(1)
              )
            ),
            c.br(0)
          )),
          c.if(
            c.i64_eqz(c.getLocal("sx")),
            [
              ...c.br_if(
                2,
                c.i32_eqz(c.call(prefix + "_gte", R, Y))
              ),
              ...c.setLocal("sx", c.i64_const(1)),
              ...c.setLocal("ec", c.i32_const(0))
            ]
          ),
          c.call(prefix + "__mul1", Y, c.getLocal("sx"), R2),
          c.drop(c.call(
            prefix + "_sub",
            R,
            c.i32_sub(R2, c.getLocal("ec")),
            R
          )),
          c.call(
            prefix + "__add1",
            c.i32_add(C, c.getLocal("ec")),
            c.getLocal("sx")
          ),
          c.br(0)
        )));
      }
      function buildInverseMod() {
        const f2 = module3.addFunction(prefix + "_inverseMod");
        f2.addParam("px", "i32");
        f2.addParam("pm", "i32");
        f2.addParam("pr", "i32");
        f2.addLocal("t", "i32");
        f2.addLocal("newt", "i32");
        f2.addLocal("r", "i32");
        f2.addLocal("qq", "i32");
        f2.addLocal("qr", "i32");
        f2.addLocal("newr", "i32");
        f2.addLocal("swp", "i32");
        f2.addLocal("x", "i32");
        f2.addLocal("signt", "i32");
        f2.addLocal("signnewt", "i32");
        f2.addLocal("signx", "i32");
        const c = f2.getCodeBuilder();
        const aux1 = c.i32_const(module3.alloc(n8));
        const aux2 = c.i32_const(module3.alloc(n8));
        const aux3 = c.i32_const(module3.alloc(n8));
        const aux4 = c.i32_const(module3.alloc(n8));
        const aux5 = c.i32_const(module3.alloc(n8));
        const aux6 = c.i32_const(module3.alloc(n8));
        const mulBuff = c.i32_const(module3.alloc(n8 * 2));
        const aux7 = c.i32_const(module3.alloc(n8));
        f2.addCode(
          c.setLocal("t", aux1),
          c.call(prefix + "_zero", aux1),
          c.setLocal("signt", c.i32_const(0))
        );
        f2.addCode(
          c.setLocal("r", aux2),
          c.call(prefix + "_copy", c.getLocal("pm"), aux2)
        );
        f2.addCode(
          c.setLocal("newt", aux3),
          c.call(prefix + "_one", aux3),
          c.setLocal("signnewt", c.i32_const(0))
        );
        f2.addCode(
          c.setLocal("newr", aux4),
          c.call(prefix + "_copy", c.getLocal("px"), aux4)
        );
        f2.addCode(c.setLocal("qq", aux5));
        f2.addCode(c.setLocal("qr", aux6));
        f2.addCode(c.setLocal("x", aux7));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.call(prefix + "_isZero", c.getLocal("newr"))
          ),
          c.call(prefix + "_div", c.getLocal("r"), c.getLocal("newr"), c.getLocal("qq"), c.getLocal("qr")),
          c.call(prefix + "_mul", c.getLocal("qq"), c.getLocal("newt"), mulBuff),
          c.if(
            c.getLocal("signt"),
            c.if(
              c.getLocal("signnewt"),
              c.if(
                c.call(prefix + "_gte", mulBuff, c.getLocal("t")),
                [
                  ...c.drop(c.call(prefix + "_sub", mulBuff, c.getLocal("t"), c.getLocal("x"))),
                  ...c.setLocal("signx", c.i32_const(0))
                ],
                [
                  ...c.drop(c.call(prefix + "_sub", c.getLocal("t"), mulBuff, c.getLocal("x"))),
                  ...c.setLocal("signx", c.i32_const(1))
                ]
              ),
              [
                ...c.drop(c.call(prefix + "_add", mulBuff, c.getLocal("t"), c.getLocal("x"))),
                ...c.setLocal("signx", c.i32_const(1))
              ]
            ),
            c.if(
              c.getLocal("signnewt"),
              [
                ...c.drop(c.call(prefix + "_add", mulBuff, c.getLocal("t"), c.getLocal("x"))),
                ...c.setLocal("signx", c.i32_const(0))
              ],
              c.if(
                c.call(prefix + "_gte", c.getLocal("t"), mulBuff),
                [
                  ...c.drop(c.call(prefix + "_sub", c.getLocal("t"), mulBuff, c.getLocal("x"))),
                  ...c.setLocal("signx", c.i32_const(0))
                ],
                [
                  ...c.drop(c.call(prefix + "_sub", mulBuff, c.getLocal("t"), c.getLocal("x"))),
                  ...c.setLocal("signx", c.i32_const(1))
                ]
              )
            )
          ),
          c.setLocal("swp", c.getLocal("t")),
          c.setLocal("t", c.getLocal("newt")),
          c.setLocal("newt", c.getLocal("x")),
          c.setLocal("x", c.getLocal("swp")),
          c.setLocal("signt", c.getLocal("signnewt")),
          c.setLocal("signnewt", c.getLocal("signx")),
          c.setLocal("swp", c.getLocal("r")),
          c.setLocal("r", c.getLocal("newr")),
          c.setLocal("newr", c.getLocal("qr")),
          c.setLocal("qr", c.getLocal("swp")),
          c.br(0)
        )));
        f2.addCode(c.if(
          c.getLocal("signt"),
          c.drop(c.call(prefix + "_sub", c.getLocal("pm"), c.getLocal("t"), c.getLocal("pr"))),
          c.call(prefix + "_copy", c.getLocal("t"), c.getLocal("pr"))
        ));
      }
      buildCopy();
      buildZero();
      buildIsZero();
      buildOne();
      buildEq();
      buildGte();
      buildAdd();
      buildSub();
      buildMul();
      buildMulOld();
      buildDiv();
      buildInverseMod();
      module3.exportFunction(prefix + "_copy");
      module3.exportFunction(prefix + "_zero");
      module3.exportFunction(prefix + "_one");
      module3.exportFunction(prefix + "_isZero");
      module3.exportFunction(prefix + "_eq");
      module3.exportFunction(prefix + "_gte");
      module3.exportFunction(prefix + "_add");
      module3.exportFunction(prefix + "_sub");
      module3.exportFunction(prefix + "_mulOld");
      module3.exportFunction(prefix + "_mul");
      module3.exportFunction(prefix + "_div");
      module3.exportFunction(prefix + "_inverseMod");
      return prefix;
    };
  }
});

// src/build_f1m.js
var require_build_f1m = __commonJS({
  "src/build_f1m.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var buildInt = require_build_int();
    var utils = require_utils2();
    module2.exports = function buildF1m(module3, _q, _prefix, _intPrefix) {
      const q = bigInt2(_q);
      const n64 = Math.floor((q.minus(1).bitLength() - 1) / 64) + 1;
      const n32 = n64 * 2;
      const n8 = n64 * 8;
      const prefix = _prefix || "f1m";
      if (module3.modules[prefix]) return prefix;
      const intPrefix = buildInt(module3, n64, _intPrefix);
      const pq = module3.alloc(n8, utils.bigInt2BytesLE(q, n8));
      const pR2 = module3.alloc(utils.bigInt2BytesLE(bigInt2.one.shiftLeft(n64 * 64).square().mod(q), n8));
      const pOne = module3.alloc(utils.bigInt2BytesLE(bigInt2.one.shiftLeft(n64 * 64).mod(q), n8));
      const pZero = module3.alloc(utils.bigInt2BytesLE(bigInt2.zero, n8));
      module3.modules[prefix] = {
        pq,
        pR2,
        n64,
        q,
        pOne,
        pZero
      };
      function buildOne() {
        const f2 = module3.addFunction(prefix + "_one");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(prefix + "_copy", c.i32_const(pOne), c.getLocal("pr")));
      }
      function buildAdd() {
        const f2 = module3.addFunction(prefix + "_add");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.if(
            c.call(intPrefix + "_add", c.getLocal("x"), c.getLocal("y"), c.getLocal("r")),
            c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r"))),
            c.if(
              c.call(intPrefix + "_gte", c.getLocal("r"), c.i32_const(pq)),
              c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
            )
          )
        );
      }
      function buildSub() {
        const f2 = module3.addFunction(prefix + "_sub");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.if(
            c.call(intPrefix + "_sub", c.getLocal("x"), c.getLocal("y"), c.getLocal("r")),
            c.drop(c.call(intPrefix + "_add", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
          )
        );
      }
      function buildNeg() {
        const f2 = module3.addFunction(prefix + "_neg");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.if(
            c.i32_eqz(c.call(intPrefix + "_isZero", c.getLocal("x"))),
            c.drop(c.call(intPrefix + "_sub", c.i32_const(pq), c.getLocal("x"), c.getLocal("r")))
          )
        );
      }
      function buildMReduct() {
        const carries = module3.alloc(n32 * n32 * 8);
        const f2 = module3.addFunction(prefix + "_mReduct");
        f2.addParam("t", "i32");
        f2.addParam("r", "i32");
        f2.addLocal("np32", "i64");
        f2.addLocal("c", "i64");
        f2.addLocal("m", "i64");
        const c = f2.getCodeBuilder();
        const np32 = bigInt2("100000000", 16).minus(q.modInv(bigInt2("100000000", 16))).toJSNumber();
        f2.addCode(c.setLocal("np32", c.i64_const(np32)));
        for (let i = 0; i < n32; i++) {
          f2.addCode(c.setLocal("c", c.i64_const(0)));
          f2.addCode(
            c.setLocal(
              "m",
              c.i64_and(
                c.i64_mul(
                  c.i64_load32_u(c.getLocal("t"), i * 4),
                  c.getLocal("np32")
                ),
                c.i64_const("0xFFFFFFFF")
              )
            )
          );
          for (let j = 0; j < n32; j++) {
            f2.addCode(
              c.setLocal(
                "c",
                c.i64_add(
                  c.i64_add(
                    c.i64_load32_u(c.getLocal("t"), (i + j) * 4),
                    c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
                  ),
                  c.i64_mul(
                    c.i64_load32_u(c.i32_const(pq), j * 4),
                    c.getLocal("m")
                  )
                )
              )
            );
            f2.addCode(
              c.i64_store32(
                c.getLocal("t"),
                (i + j) * 4,
                c.getLocal("c")
              )
            );
          }
          f2.addCode(
            c.i64_store32(
              c.i32_const(carries),
              i * 4,
              c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
            )
          );
        }
        f2.addCode(
          c.call(
            prefix + "_add",
            c.i32_const(carries),
            c.i32_add(
              c.getLocal("t"),
              c.i32_const(n32 * 4)
            ),
            c.getLocal("r")
          )
        );
      }
      function buildMul() {
        const f2 = module3.addFunction(prefix + "_mul");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        f2.addLocal("c0", "i64");
        f2.addLocal("c1", "i64");
        f2.addLocal("np32", "i64");
        for (let i = 0; i < n32; i++) {
          f2.addLocal("x" + i, "i64");
          f2.addLocal("y" + i, "i64");
          f2.addLocal("m" + i, "i64");
          f2.addLocal("q" + i, "i64");
        }
        const c = f2.getCodeBuilder();
        const np32 = bigInt2("100000000", 16).minus(q.modInv(bigInt2("100000000", 16))).toJSNumber();
        f2.addCode(c.setLocal("np32", c.i64_const(np32)));
        const loadX = [];
        const loadY = [];
        const loadQ = [];
        function mulij(i, j) {
          let X, Y;
          if (!loadX[i]) {
            X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
            loadX[i] = true;
          } else {
            X = c.getLocal("x" + i);
          }
          if (!loadY[j]) {
            Y = c.teeLocal("y" + j, c.i64_load32_u(c.getLocal("y"), j * 4));
            loadY[j] = true;
          } else {
            Y = c.getLocal("y" + j);
          }
          return c.i64_mul(X, Y);
        }
        function mulqm(i, j) {
          let Q, M;
          if (!loadQ[i]) {
            Q = c.teeLocal("q" + i, c.i64_load32_u(c.i32_const(0), pq + i * 4));
            loadQ[i] = true;
          } else {
            Q = c.getLocal("q" + i);
          }
          M = c.getLocal("m" + j);
          return c.i64_mul(Q, M);
        }
        let c0 = "c0";
        let c1 = "c1";
        for (let k = 0; k < n32 * 2 - 1; k++) {
          for (let i = Math.max(0, k - n32 + 1); i <= k && i < n32; i++) {
            const j = k - i;
            f2.addCode(
              c.setLocal(
                c0,
                c.i64_add(
                  c.i64_and(
                    c.getLocal(c0),
                    c.i64_const(4294967295)
                  ),
                  mulij(i, j)
                )
              )
            );
            f2.addCode(
              c.setLocal(
                c1,
                c.i64_add(
                  c.getLocal(c1),
                  c.i64_shr_u(
                    c.getLocal(c0),
                    c.i64_const(32)
                  )
                )
              )
            );
          }
          for (let i = Math.max(1, k - n32 + 1); i <= k && i < n32; i++) {
            const j = k - i;
            f2.addCode(
              c.setLocal(
                c0,
                c.i64_add(
                  c.i64_and(
                    c.getLocal(c0),
                    c.i64_const(4294967295)
                  ),
                  mulqm(i, j)
                )
              )
            );
            f2.addCode(
              c.setLocal(
                c1,
                c.i64_add(
                  c.getLocal(c1),
                  c.i64_shr_u(
                    c.getLocal(c0),
                    c.i64_const(32)
                  )
                )
              )
            );
          }
          if (k < n32) {
            f2.addCode(
              c.setLocal(
                "m" + k,
                c.i64_and(
                  c.i64_mul(
                    c.i64_and(
                      c.getLocal(c0),
                      c.i64_const(4294967295)
                    ),
                    c.getLocal("np32")
                  ),
                  c.i64_const("0xFFFFFFFF")
                )
              )
            );
            f2.addCode(
              c.setLocal(
                c0,
                c.i64_add(
                  c.i64_and(
                    c.getLocal(c0),
                    c.i64_const(4294967295)
                  ),
                  mulqm(0, k)
                )
              )
            );
            f2.addCode(
              c.setLocal(
                c1,
                c.i64_add(
                  c.getLocal(c1),
                  c.i64_shr_u(
                    c.getLocal(c0),
                    c.i64_const(32)
                  )
                )
              )
            );
          }
          if (k >= n32) {
            f2.addCode(
              c.i64_store32(
                c.getLocal("r"),
                (k - n32) * 4,
                c.getLocal(c0)
              )
            );
          }
          [c0, c1] = [c1, c0];
          f2.addCode(
            c.setLocal(
              c1,
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          );
        }
        f2.addCode(
          c.i64_store32(
            c.getLocal("r"),
            n32 * 4 - 4,
            c.getLocal(c0)
          )
        );
        f2.addCode(
          c.if(
            c.i32_wrap_i64(c.getLocal(c1)),
            c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r"))),
            c.if(
              c.call(intPrefix + "_gte", c.getLocal("r"), c.i32_const(pq)),
              c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
            )
          )
        );
      }
      function buildMulOld() {
        const pAux2 = module3.alloc(n8 * 2);
        const f2 = module3.addFunction(prefix + "_mulOld");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(intPrefix + "_mulOld", c.getLocal("x"), c.getLocal("y"), c.i32_const(pAux2)));
        f2.addCode(c.call(prefix + "_mReduct", c.i32_const(pAux2), c.getLocal("r")));
      }
      function buildToMontgomery() {
        const f2 = module3.addFunction(prefix + "_toMontgomery");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.i32_const(pR2), c.getLocal("r")));
      }
      function buildFromMontgomery() {
        const pAux2 = module3.alloc(n8 * 2);
        const f2 = module3.addFunction(prefix + "_fromMontgomery");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(intPrefix + "_copy", c.getLocal("x"), c.i32_const(pAux2)));
        f2.addCode(c.call(intPrefix + "_zero", c.i32_const(pAux2 + n8)));
        f2.addCode(c.call(prefix + "_mReduct", c.i32_const(pAux2), c.getLocal("r")));
      }
      function buildInverse() {
        const f2 = module3.addFunction(prefix + "_inverse");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(prefix + "_fromMontgomery", c.getLocal("x"), c.getLocal("r")));
        f2.addCode(c.call(intPrefix + "_inverseMod", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")));
        f2.addCode(c.call(prefix + "_toMontgomery", c.getLocal("r"), c.getLocal("r")));
      }
      buildAdd();
      buildSub();
      buildNeg();
      buildMReduct();
      buildMul();
      buildMulOld();
      buildToMontgomery();
      buildFromMontgomery();
      buildInverse();
      module3.exportFunction(prefix + "_add");
      module3.exportFunction(prefix + "_sub");
      module3.exportFunction(prefix + "_neg");
      module3.exportFunction(prefix + "_mReduct");
      module3.exportFunction(prefix + "_mul");
      module3.exportFunction(prefix + "_mulOld");
      module3.exportFunction(prefix + "_fromMontgomery");
      module3.exportFunction(prefix + "_toMontgomery");
      module3.exportFunction(prefix + "_inverse");
      module3.exportFunction(intPrefix + "_copy", prefix + "_copy");
      module3.exportFunction(intPrefix + "_zero", prefix + "_zero");
      module3.exportFunction(intPrefix + "_isZero", prefix + "_isZero");
      module3.exportFunction(intPrefix + "_eq", prefix + "_eq");
      buildOne();
      module3.exportFunction(prefix + "_one");
      return prefix;
    };
  }
});

// src/build_f1.js
var require_build_f1 = __commonJS({
  "src/build_f1.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var buildF1m = require_build_f1m();
    module2.exports = function buildF1(module3, _q, _prefix, _f1mPrefix, _intPrefix) {
      const q = bigInt2(_q);
      const n64 = Math.floor((q.minus(1).bitLength() - 1) / 64) + 1;
      const n8 = n64 * 8;
      const prefix = _prefix || "f1";
      if (module3.modules[prefix]) return prefix;
      module3.modules[prefix] = {
        n64
      };
      const intPrefix = _intPrefix || "int";
      const f1mPrefix = buildF1m(module3, q, _f1mPrefix, intPrefix);
      const pR2 = module3.modules[f1mPrefix].pR2;
      const pq = module3.modules[f1mPrefix].pq;
      function buildMul() {
        const pAux1 = module3.alloc(n8);
        const f2 = module3.addFunction(prefix + "_mul");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(f1mPrefix + "_mul", c.getLocal("x"), c.getLocal("y"), c.i32_const(pAux1)));
        f2.addCode(c.call(f1mPrefix + "_mul", c.i32_const(pAux1), c.i32_const(pR2), c.getLocal("r")));
      }
      function buildInverse() {
        const f2 = module3.addFunction(prefix + "_inverse");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(intPrefix + "_inverseMod", c.getLocal("x"), c.i32_const(pq), c.getLocal("r")));
      }
      buildMul();
      buildInverse();
      module3.exportFunction(f1mPrefix + "_add", prefix + "_add");
      module3.exportFunction(f1mPrefix + "_sub", prefix + "_sub");
      module3.exportFunction(f1mPrefix + "_neg", prefix + "_neg");
      module3.exportFunction(prefix + "_mul");
      module3.exportFunction(prefix + "_inverse");
      module3.exportFunction(f1mPrefix + "_copy", prefix + "_copy");
      module3.exportFunction(f1mPrefix + "_zero", prefix + "_zero");
      module3.exportFunction(f1mPrefix + "_one", prefix + "_one");
      module3.exportFunction(f1mPrefix + "_isZero", prefix + "_isZero");
      module3.exportFunction(f1mPrefix + "_eq", prefix + "_eq");
      return prefix;
    };
  }
});

// src/build_testf1.js
var require_build_testf1 = __commonJS({
  "src/build_testf1.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var utils = require_utils2();
    module2.exports = function buildTestF1(module3) {
      const q = bigInt2("21888242871839275222246405745257275088696311157297823662689037894645226208583");
      const pR2 = module3.modules.f1m.pR2;
      const n8 = module3.modules.f1m.n64 * 8;
      const pR3 = module3.alloc(utils.bigInt2BytesLE(bigInt2.one.shiftLeft(256).square().mod(q).shiftRight(128), n8));
      function buildTestF12() {
        const f2 = module3.addFunction("testF1");
        f2.addParam("n", "i32");
        f2.addLocal("i", "i32");
        const c = f2.getCodeBuilder();
        const pAux1 = module3.alloc(n8);
        f2.addCode(c.setLocal("i", c.getLocal("n")));
        f2.addCode(c.block(c.loop(
          //            c.call("f1m_add", c.i32_const(pR2), c.i32_const(pR2), c.i32_const(pAux1)),
          c.call("f1m_mul", c.i32_const(pR2), c.i32_const(pR2), c.i32_const(pAux1)),
          //            c.call("int_div", c.i32_const(pR2), c.i32_const(pR3), c.i32_const(pAux1), c.i32_const(0)),
          c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
          c.br_if(1, c.i32_eqz(c.getLocal("i"))),
          c.br(0)
        )));
      }
      buildTestF12();
      module3.exportFunction("testF1");
    };
  }
});

// src/f1.js
var require_f1 = __commonJS({
  "src/f1.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var ModuleBuilder = require_wasmbuilder();
    var buildF1 = require_build_f1();
    var buildTestF1 = require_build_testf1();
    async function build(q) {
      const f1 = new F1(q);
      f1.q = bigInt2(q);
      f1.n64 = Math.floor((f1.q.minus(1).bitLength() - 1) / 64) + 1;
      f1.n32 = f1.n64 * 2;
      f1.n8 = f1.n64 * 8;
      f1.memory = new WebAssembly.Memory({ initial: 1 });
      f1.i32 = new Uint32Array(f1.memory.buffer);
      const moduleBuilder = new ModuleBuilder();
      buildF1(moduleBuilder, f1.q);
      buildTestF1(moduleBuilder);
      const code = moduleBuilder.build();
      const wasmModule = await WebAssembly.compile(code);
      f1.instance = await WebAssembly.instantiate(wasmModule, {
        env: {
          "memory": f1.memory
        }
      });
      Object.assign(f1, f1.instance.exports);
      return f1;
    }
    var F1 = class {
      constructor() {
      }
      alloc(length) {
        const res = this.i32[0];
        this.i32[0] += length;
        return res;
      }
      putInt(pos, _a) {
        const a = bigInt2(_a);
        if (pos & 7) throw new Error("Pointer must be aligned");
        if (a.bitLength > this.n64 * 64) {
          return this.putInt(a.mod(this.q));
        }
        for (let i = 0; i < this.n32; i++) {
          this.i32[(pos >> 2) + i] = a.shiftRight(i * 32).and(4294967295).toJSNumber();
        }
      }
      allocInt(_a) {
        const p = this.alloc(this.n8);
        if (_a) this.putInt(p, _a);
        return p;
      }
      putInt2(pos, _a) {
        const a = bigInt2(_a);
        if (pos & 7) throw new Error("Pointer must be aligned");
        if (a.bitLength > this.n64 * 64 * 2) {
          return this.putInt(a.mod(this.q));
        }
        for (let i = 0; i < this.n32 * 2; i++) {
          this.i32[(pos >> 2) + i] = a.shiftRight(i * 32).and(4294967295).toJSNumber();
        }
      }
      getInt(pos) {
        if (pos & 7) throw new Error("Pointer must be aligned");
        let acc = bigInt2(this.i32[(pos >> 2) + this.n32 - 1]);
        for (let i = this.n32 - 2; i >= 0; i--) {
          acc = acc.shiftLeft(32);
          acc = acc.add(this.i32[(pos >> 2) + i]);
        }
        return acc;
      }
      getInt2(pos) {
        if (pos & 7) throw new Error("Pointer must be aligned");
        const last = this.n32 * 2 - 1;
        let acc = bigInt2(this.i32[(pos >> 2) + last]);
        for (let i = last; i >= 0; i--) {
          acc = acc.shiftLeft(32);
          acc = acc.add(this.i32[(pos >> 2) + i]);
        }
        return acc;
      }
      allocInt2(_a) {
        const p = this.alloc(this.n8 * 2);
        if (_a) this.putInt2(p, _a);
        return p;
      }
      test_F1(n) {
        const start = (/* @__PURE__ */ new Date()).getTime();
        this.instance.exports.testF1(n);
        const end = (/* @__PURE__ */ new Date()).getTime();
        const time = end - start;
        return time;
      }
      /*
          function test(n) {
      
              const q = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;
              let a = (1n << 512n)%q ;
              let b = a >> 128n;
      
              let c;
      
              const start = new Date().getTime();
              for (let i=0; i<n; i++) c = a+b;
      
              const end = new Date().getTime();
              const time = end - start;
      
              console.log(time);
          }
      */
    };
    module2.exports = build;
  }
});

// src/build_f2m.js
var require_build_f2m = __commonJS({
  "src/build_f2m.js"(exports2, module2) {
    module2.exports = function buildF2m(module3, pNonResidue, prefix, f1mPrefix) {
      if (module3.modules[prefix]) return prefix;
      const f1n8 = module3.modules[f1mPrefix].n64 * 8;
      module3.modules[prefix] = {
        n64: module3.modules[f1mPrefix].n64 * 2
      };
      function buildAdd() {
        const f2 = module3.addFunction(prefix + "_add");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const y0 = c.getLocal("y");
        const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
        const r0 = c.getLocal("r");
        const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_add", x0, y0, r0),
          c.call(f1mPrefix + "_add", x1, y1, r1)
        );
      }
      function buildSub() {
        const f2 = module3.addFunction(prefix + "_sub");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const y0 = c.getLocal("y");
        const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
        const r0 = c.getLocal("r");
        const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_sub", x0, y0, r0),
          c.call(f1mPrefix + "_sub", x1, y1, r1)
        );
      }
      function buildNeg() {
        const f2 = module3.addFunction(prefix + "_neg");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const r0 = c.getLocal("r");
        const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_neg", x0, r0),
          c.call(f1mPrefix + "_neg", x1, r1)
        );
      }
      function buildMul() {
        const f2 = module3.addFunction(prefix + "_mul");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const y0 = c.getLocal("y");
        const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
        const r0 = c.getLocal("r");
        const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
        const A = c.i32_const(module3.alloc(f1n8));
        const B = c.i32_const(module3.alloc(f1n8));
        const C = c.i32_const(module3.alloc(f1n8));
        const D = c.i32_const(module3.alloc(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_mul", x0, y0, A),
          // A = x0*y0
          c.call(f1mPrefix + "_mul", x1, y1, B),
          // B = x1*y1
          c.call(f1mPrefix + "_add", x0, x1, C),
          // C = x0 + x1
          c.call(f1mPrefix + "_add", y0, y1, D),
          // D = y0 + y1
          c.call(f1mPrefix + "_mul", C, D, C),
          // C = (x0 + x1)*(y0 + y1) = x0*y0+x0*y1+x1*y0+x1*y1
          c.call(f1mPrefix + "_mul", B, c.i32_const(pNonResidue), r0),
          // r0 = nr*(x1*y1)
          c.call(f1mPrefix + "_add", A, r0, r0),
          // r0 = x0*y0 + nr*(x1*y1)
          c.call(f1mPrefix + "_add", A, B, r1),
          // r1 = x0*y0+x1*y1
          c.call(f1mPrefix + "_sub", C, r1, r1)
          // r1 = x0*y0+x0*y1+x1*y0+x1*y1 - x0*y0+x1*y1 = x0*y1+x1*y0
        );
      }
      function buildToMontgomery() {
        const f2 = module3.addFunction(prefix + "_toMontgomery");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const r0 = c.getLocal("r");
        const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_toMontgomery", x0, r0),
          c.call(f1mPrefix + "_toMontgomery", x1, r1)
        );
      }
      function buildFromMontgomery() {
        const f2 = module3.addFunction(prefix + "_fromMontgomery");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const r0 = c.getLocal("r");
        const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_fromMontgomery", x0, r0),
          c.call(f1mPrefix + "_fromMontgomery", x1, r1)
        );
      }
      function buildCopy() {
        const f2 = module3.addFunction(prefix + "_copy");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const r0 = c.getLocal("r");
        const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_copy", x0, r0),
          c.call(f1mPrefix + "_copy", x1, r1)
        );
      }
      function buildZero() {
        const f2 = module3.addFunction(prefix + "_zero");
        f2.addParam("x", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_zero", x0),
          c.call(f1mPrefix + "_zero", x1)
        );
      }
      function buildOne() {
        const f2 = module3.addFunction(prefix + "_one");
        f2.addParam("x", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_one", x0),
          c.call(f1mPrefix + "_zero", x1)
        );
      }
      function buildEq() {
        const f2 = module3.addFunction(prefix + "_eq");
        f2.addParam("x", "i32");
        f2.addParam("y", "i32");
        f2.setReturnType("i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const y0 = c.getLocal("y");
        const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
        f2.addCode(
          c.i32_and(
            c.call(f1mPrefix + "_eq", x0, y0),
            c.call(f1mPrefix + "_eq", x1, y1)
          )
        );
      }
      function buildIsZero() {
        const f2 = module3.addFunction(prefix + "_isZero");
        f2.addParam("x", "i32");
        f2.setReturnType("i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        f2.addCode(
          c.i32_and(
            c.call(f1mPrefix + "_isZero", x0),
            c.call(f1mPrefix + "_isZero", x1)
          )
        );
      }
      function buildInverse() {
        const f2 = module3.addFunction(prefix + "_inverse");
        f2.addParam("x", "i32");
        f2.addParam("r", "i32");
        const c = f2.getCodeBuilder();
        const x0 = c.getLocal("x");
        const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
        const r0 = c.getLocal("r");
        const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
        const t0 = c.i32_const(module3.alloc(f1n8));
        const t1 = c.i32_const(module3.alloc(f1n8));
        const t2 = c.i32_const(module3.alloc(f1n8));
        const t3 = c.i32_const(module3.alloc(f1n8));
        f2.addCode(
          c.call(f1mPrefix + "_mul", x0, x0, t0),
          c.call(f1mPrefix + "_mul", x1, x1, t1),
          c.call(f1mPrefix + "_mul", t1, c.i32_const(pNonResidue), t2),
          c.call(f1mPrefix + "_sub", t0, t2, t2),
          c.call(f1mPrefix + "_inverse", t2, t3),
          c.call(f1mPrefix + "_mul", x0, t3, r0),
          c.call(f1mPrefix + "_mul", x1, t3, r1),
          c.call(f1mPrefix + "_neg", r1, r1)
        );
      }
      buildIsZero();
      buildZero();
      buildOne();
      buildCopy();
      buildMul();
      buildAdd();
      buildSub();
      buildNeg();
      buildToMontgomery();
      buildFromMontgomery();
      buildEq();
      buildInverse();
      module3.exportFunction(prefix + "_isZero");
      module3.exportFunction(prefix + "_zero");
      module3.exportFunction(prefix + "_one");
      module3.exportFunction(prefix + "_copy");
      module3.exportFunction(prefix + "_mul");
      module3.exportFunction(prefix + "_add");
      module3.exportFunction(prefix + "_sub");
      module3.exportFunction(prefix + "_neg");
      module3.exportFunction(prefix + "_fromMontgomery");
      module3.exportFunction(prefix + "_toMontgomery");
      module3.exportFunction(prefix + "_eq");
      module3.exportFunction(prefix + "_inverse");
      return prefix;
    };
  }
});

// src/build_timesscalar.js
var require_build_timesscalar = __commonJS({
  "src/build_timesscalar.js"(exports2, module2) {
    module2.exports = function buildTimesScalar(module3, fnName, elementLen, opAB, opAA, fPrefix) {
      const f2 = module3.addFunction(fnName);
      f2.addParam("base", "i32");
      f2.addParam("scalar", "i32");
      f2.addParam("scalarLength", "i32");
      f2.addParam("r", "i32");
      f2.addLocal("i", "i32");
      f2.addLocal("b", "i32");
      const c = f2.getCodeBuilder();
      const aux = c.i32_const(module3.alloc(elementLen));
      f2.addCode(c.call(fPrefix + "_copy", c.getLocal("base"), aux));
      f2.addCode(c.call(fPrefix + "_zero", c.getLocal("r")));
      f2.addCode(c.setLocal("i", c.getLocal("scalarLength")));
      f2.addCode(c.block(c.loop(
        c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
        c.setLocal(
          "b",
          c.i32_load8_u(
            c.i32_add(
              c.getLocal("scalar"),
              c.getLocal("i")
            )
          )
        ),
        ...innerLoop(),
        c.br_if(1, c.i32_eqz(c.getLocal("i"))),
        c.br(0)
      )));
      function innerLoop() {
        const code = [];
        for (let i = 0; i < 8; i++) {
          code.push(
            ...c.call(opAA, c.getLocal("r"), c.getLocal("r")),
            ...c.if(
              c.i32_ge_u(c.getLocal("b"), c.i32_const(128 >> i)),
              [
                ...c.setLocal(
                  "b",
                  c.i32_sub(
                    c.getLocal("b"),
                    c.i32_const(128 >> i)
                  )
                ),
                ...c.call(opAB, aux, c.getLocal("r"), c.getLocal("r"))
              ]
            )
          );
        }
        return code;
      }
    };
  }
});

// src/build_curve.js
var require_build_curve = __commonJS({
  "src/build_curve.js"(exports2, module2) {
    var buildTimesScalar = require_build_timesscalar();
    module2.exports = function buildCurve(module3, prefix, prefixField) {
      const n64 = module3.modules[prefixField].n64;
      const n8 = n64 * 8;
      if (module3.modules[prefix]) return prefix;
      module3.modules[prefix] = {
        n64: n64 * 3
      };
      function buildIsZero() {
        const f2 = module3.addFunction(prefix + "_isZero");
        f2.addParam("p1", "i32");
        f2.setReturnType("i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(
          prefixField + "_isZero",
          c.i32_add(
            c.getLocal("p1"),
            c.i32_const(n8 * 2)
          )
        ));
      }
      function buildCopy() {
        const f2 = module3.addFunction(prefix + "_copy");
        f2.addParam("p1", "i32");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(
          prefixField + "_copy",
          c.getLocal("p1"),
          c.getLocal("pr")
        ));
        f2.addCode(c.call(
          prefixField + "_copy",
          c.i32_add(
            c.getLocal("p1"),
            c.i32_const(n8)
          ),
          c.i32_add(
            c.getLocal("pr"),
            c.i32_const(n8)
          )
        ));
        f2.addCode(c.call(
          prefixField + "_copy",
          c.i32_add(
            c.getLocal("p1"),
            c.i32_const(n8 * 2)
          ),
          c.i32_add(
            c.getLocal("pr"),
            c.i32_const(n8 * 2)
          )
        ));
      }
      function buildZero() {
        const f2 = module3.addFunction(prefix + "_zero");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(
          prefixField + "_zero",
          c.getLocal("pr")
        ));
        f2.addCode(c.call(
          prefixField + "_one",
          c.i32_add(
            c.getLocal("pr"),
            c.i32_const(n8)
          )
        ));
        f2.addCode(c.call(
          prefixField + "_zero",
          c.i32_add(
            c.getLocal("pr"),
            c.i32_const(n8 * 2)
          )
        ));
      }
      function buildDouble() {
        const f2 = module3.addFunction(prefix + "_double");
        f2.addParam("p1", "i32");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        const x = c.getLocal("p1");
        const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
        const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
        const x3 = c.getLocal("pr");
        const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
        const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
        const A = c.i32_const(module3.alloc(n8));
        const B = c.i32_const(module3.alloc(n8));
        const C = c.i32_const(module3.alloc(n8));
        const D = c.i32_const(module3.alloc(n8));
        const E = c.i32_const(module3.alloc(n8));
        const F = c.i32_const(module3.alloc(n8));
        const G = c.i32_const(module3.alloc(n8));
        const eightC = c.i32_const(module3.alloc(n8));
        f2.addCode(
          c.if(
            c.call(prefix + "_isZero", c.getLocal("p1")),
            [
              ...c.call(prefix + "_copy", c.getLocal("p1"), c.getLocal("pr")),
              ...c.ret([])
            ]
          ),
          c.call(prefixField + "_mul", x, x, A),
          c.call(prefixField + "_mul", y, y, B),
          c.call(prefixField + "_mul", B, B, C),
          c.call(prefixField + "_add", x, B, D),
          c.call(prefixField + "_mul", D, D, D),
          c.call(prefixField + "_sub", D, A, D),
          c.call(prefixField + "_sub", D, C, D),
          c.call(prefixField + "_add", D, D, D),
          c.call(prefixField + "_add", A, A, E),
          c.call(prefixField + "_add", E, A, E),
          c.call(prefixField + "_mul", E, E, F),
          c.call(prefixField + "_mul", y, z, G),
          c.call(prefixField + "_add", D, D, x3),
          c.call(prefixField + "_sub", F, x3, x3),
          c.call(prefixField + "_add", C, C, eightC),
          c.call(prefixField + "_add", eightC, eightC, eightC),
          c.call(prefixField + "_add", eightC, eightC, eightC),
          c.call(prefixField + "_sub", D, x3, y3),
          c.call(prefixField + "_mul", y3, E, y3),
          c.call(prefixField + "_sub", y3, eightC, y3),
          c.call(prefixField + "_add", G, G, z3)
        );
      }
      function buildToMontgomery() {
        const f2 = module3.addFunction(prefix + "_toMontgomery");
        f2.addParam("p1", "i32");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(
          prefixField + "_toMontgomery",
          c.getLocal("p1"),
          c.getLocal("pr")
        ));
        for (let i = 1; i < 3; i++) {
          f2.addCode(c.call(
            prefixField + "_toMontgomery",
            c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
            c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
          ));
        }
      }
      function buildFromMontgomery() {
        const f2 = module3.addFunction(prefix + "_fromMontgomery");
        f2.addParam("p1", "i32");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call(
          prefixField + "_fromMontgomery",
          c.getLocal("p1"),
          c.getLocal("pr")
        ));
        for (let i = 1; i < 3; i++) {
          f2.addCode(c.call(
            prefixField + "_fromMontgomery",
            c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
            c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
          ));
        }
      }
      function buildAdd() {
        const f2 = module3.addFunction(prefix + "_add");
        f2.addParam("p1", "i32");
        f2.addParam("p2", "i32");
        f2.addParam("pr", "i32");
        f2.addLocal("z1", "i32");
        f2.addLocal("z2", "i32");
        const c = f2.getCodeBuilder();
        const x1 = c.getLocal("p1");
        const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
        f2.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
        const z1 = c.getLocal("z1");
        const x2 = c.getLocal("p2");
        const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
        f2.addCode(c.setLocal("z2", c.i32_add(c.getLocal("p2"), c.i32_const(n8 * 2))));
        const z2 = c.getLocal("z2");
        const x3 = c.getLocal("pr");
        const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
        const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
        const Z1Z1 = c.i32_const(module3.alloc(n8));
        const Z2Z2 = c.i32_const(module3.alloc(n8));
        const U1 = c.i32_const(module3.alloc(n8));
        const U2 = c.i32_const(module3.alloc(n8));
        const Z1_cubed = c.i32_const(module3.alloc(n8));
        const Z2_cubed = c.i32_const(module3.alloc(n8));
        const S1 = c.i32_const(module3.alloc(n8));
        const S2 = c.i32_const(module3.alloc(n8));
        const H = c.i32_const(module3.alloc(n8));
        const S2_minus_S1 = c.i32_const(module3.alloc(n8));
        const I = c.i32_const(module3.alloc(n8));
        const J = c.i32_const(module3.alloc(n8));
        const r = c.i32_const(module3.alloc(n8));
        const r2 = c.i32_const(module3.alloc(n8));
        const V = c.i32_const(module3.alloc(n8));
        const V2 = c.i32_const(module3.alloc(n8));
        const S1_J2 = c.i32_const(module3.alloc(n8));
        f2.addCode(
          c.if(
            c.call(prefix + "_isZero", c.getLocal("p1")),
            [
              ...c.call(prefix + "_copy", c.getLocal("p2"), c.getLocal("pr")),
              ...c.ret([])
            ]
          ),
          c.if(
            c.call(prefix + "_isZero", c.getLocal("p2")),
            [
              ...c.call(prefix + "_copy", c.getLocal("p1"), c.getLocal("pr")),
              ...c.ret([])
            ]
          ),
          c.call(prefixField + "_mul", z1, z1, Z1Z1),
          c.call(prefixField + "_mul", z2, z2, Z2Z2),
          c.call(prefixField + "_mul", x1, Z2Z2, U1),
          c.call(prefixField + "_mul", x2, Z1Z1, U2),
          c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
          c.call(prefixField + "_mul", z2, Z2Z2, Z2_cubed),
          c.call(prefixField + "_mul", y1, Z2_cubed, S1),
          c.call(prefixField + "_mul", y2, Z1_cubed, S2),
          c.if(
            c.call(prefixField + "_eq", U1, U2),
            c.if(
              c.call(prefixField + "_eq", S1, S2),
              [
                ...c.call(prefix + "_double", c.getLocal("p1"), c.getLocal("pr")),
                ...c.ret([])
              ]
            )
          ),
          c.call(prefixField + "_sub", U2, U1, H),
          c.call(prefixField + "_sub", S2, S1, S2_minus_S1),
          c.call(prefixField + "_add", H, H, I),
          c.call(prefixField + "_mul", I, I, I),
          c.call(prefixField + "_mul", H, I, J),
          c.call(prefixField + "_add", S2_minus_S1, S2_minus_S1, r),
          c.call(prefixField + "_mul", U1, I, V),
          c.call(prefixField + "_mul", r, r, r2),
          c.call(prefixField + "_add", V, V, V2),
          c.call(prefixField + "_sub", r2, J, x3),
          c.call(prefixField + "_sub", x3, V2, x3),
          c.call(prefixField + "_mul", S1, J, S1_J2),
          c.call(prefixField + "_add", S1_J2, S1_J2, S1_J2),
          c.call(prefixField + "_sub", V, x3, y3),
          c.call(prefixField + "_mul", y3, r, y3),
          c.call(prefixField + "_sub", y3, S1_J2, y3),
          c.call(prefixField + "_add", z1, z2, z3),
          c.call(prefixField + "_mul", z3, z3, z3),
          c.call(prefixField + "_sub", z3, Z1Z1, z3),
          c.call(prefixField + "_sub", z3, Z2Z2, z3),
          c.call(prefixField + "_mul", z3, H, z3)
        );
      }
      function buildNeg() {
        const f2 = module3.addFunction(prefix + "_neg");
        f2.addParam("p1", "i32");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        const x = c.getLocal("p1");
        const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
        const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
        const x3 = c.getLocal("pr");
        const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
        const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
        f2.addCode(
          c.call(prefixField + "_copy", x, x3),
          c.call(prefixField + "_neg", y, y3),
          c.call(prefixField + "_copy", z, z3)
        );
      }
      function buildSub() {
        const f2 = module3.addFunction(prefix + "_sub");
        f2.addParam("p1", "i32");
        f2.addParam("p2", "i32");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.call(prefix + "_neg", c.getLocal("p2"), c.getLocal("pr")),
          c.call(prefix + "_add", c.getLocal("p1"), c.getLocal("pr"), c.getLocal("pr"))
        );
      }
      function buildAffine() {
        const f2 = module3.addFunction(prefix + "_affine");
        f2.addParam("p1", "i32");
        f2.addParam("pr", "i32");
        const c = f2.getCodeBuilder();
        const x = c.getLocal("p1");
        const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
        const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
        const x3 = c.getLocal("pr");
        const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
        const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
        const Z_inv = c.i32_const(module3.alloc(n8));
        const Z2_inv = c.i32_const(module3.alloc(n8));
        const Z3_inv = c.i32_const(module3.alloc(n8));
        f2.addCode(
          c.if(
            c.call(prefix + "_isZero", c.getLocal("p1")),
            c.call(prefix + "_zero", c.getLocal("pr")),
            [
              ...c.call(prefixField + "_inverse", z, Z_inv),
              ...c.call(prefixField + "_mul", Z_inv, Z_inv, Z2_inv),
              ...c.call(prefixField + "_mul", Z_inv, Z2_inv, Z3_inv),
              ...c.call(prefixField + "_mul", x, Z2_inv, x3),
              ...c.call(prefixField + "_mul", y, Z3_inv, y3),
              ...c.call(prefixField + "_one", z3)
            ]
          )
        );
      }
      buildIsZero();
      buildZero();
      buildCopy();
      buildDouble();
      buildAdd();
      buildNeg();
      buildSub();
      buildFromMontgomery();
      buildToMontgomery();
      buildAffine();
      buildTimesScalar(
        module3,
        prefix + "_timesScalar",
        n8 * 3,
        prefix + "_add",
        prefix + "_double",
        prefix
      );
      module3.exportFunction(prefix + "_isZero");
      module3.exportFunction(prefix + "_copy");
      module3.exportFunction(prefix + "_zero");
      module3.exportFunction(prefix + "_double");
      module3.exportFunction(prefix + "_add");
      module3.exportFunction(prefix + "_neg");
      module3.exportFunction(prefix + "_sub");
      module3.exportFunction(prefix + "_fromMontgomery");
      module3.exportFunction(prefix + "_toMontgomery");
      module3.exportFunction(prefix + "_affine");
      module3.exportFunction(prefix + "_timesScalar");
      return prefix;
    };
  }
});

// src/build_testg1.js
var require_build_testg1 = __commonJS({
  "src/build_testg1.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    module2.exports = function buildTestAddG1(module3) {
      function buildTestAddG12() {
        const f2 = module3.addFunction("testAddG1");
        f2.addParam("n", "i32");
        f2.addParam("pP", "i32");
        f2.addParam("pR", "i32");
        f2.addLocal("i", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.call("g1_zero", c.getLocal("pR")));
        f2.addCode(c.setLocal("i", c.getLocal("n")));
        f2.addCode(c.block(c.loop(
          c.call("g1_add", c.getLocal("pP"), c.getLocal("pR"), c.getLocal("pR")),
          c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
          c.br_if(1, c.i32_eqz(c.getLocal("i"))),
          c.br(0)
        )));
      }
      buildTestAddG12();
      module3.exportFunction("testAddG1");
    };
  }
});

// src/build_fft.js
var require_build_fft = __commonJS({
  "src/build_fft.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var utils = require_utils2();
    module2.exports = function buildFFT(module3, prefix, f1mPrefix, overrideNr) {
      const n64 = module3.modules[f1mPrefix].n64;
      const n8 = n64 * 8;
      const q = module3.modules[f1mPrefix].q;
      let rem = q.minus(bigInt2(1));
      let maxBits = 0;
      while (!rem.isOdd()) {
        maxBits++;
        rem = rem.shiftRight(1);
      }
      let nr;
      if (overrideNr) {
        nr = bigInt2(overrideNr);
      } else {
        nr = bigInt2(2);
        while (nr.modPow(q.shiftRight(1), q).equals(1)) nr = nr.add(1);
      }
      const w = new Array(maxBits + 1);
      w[maxBits] = nr.modPow(rem, q);
      let n = maxBits - 1;
      while (n >= 0) {
        w[n] = w[n + 1].modPow(2, q);
        n--;
      }
      const bytes = [];
      const R = bigInt2(1).shiftLeft(n8 * 8).mod(q);
      for (let i = 0; i < w.length; i++) {
        const m = w[i].times(R).mod(q);
        bytes.push(...utils.bigInt2BytesLE(m, n8));
      }
      const ROOTs = module3.alloc(bytes);
      const i2 = new Array(maxBits + 1);
      i2[0] = bigInt2(1);
      for (let i = 1; i <= maxBits; i++) {
        i2[i] = i2[i - 1].times(2);
      }
      const bytesi2 = [];
      for (let i = 0; i <= maxBits; i++) {
        const m = i2[i].modInv(q).times(R).mod(q);
        bytesi2.push(...utils.bigInt2BytesLE(m, n8));
      }
      const INV2 = module3.alloc(bytesi2);
      function rev(x) {
        let r = 0;
        for (let i = 0; i < 8; i++) {
          if (x & 1 << i) {
            r = r | 128 >> i;
          }
        }
        return r;
      }
      const rtable = Array(256);
      for (let i = 0; i < 256; i++) {
        rtable[i] = rev(i);
      }
      const REVTABLE = module3.alloc(rtable);
      function buildLog2() {
        const f2 = module3.addFunction(prefix + "__log2");
        f2.addParam("n", "i32");
        f2.setReturnType("i32");
        f2.addLocal("bits", "i32");
        f2.addLocal("aux", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal(
            "aux",
            c.i32_shr_u(
              c.getLocal("n"),
              c.i32_const(1)
            )
          )
        );
        f2.addCode(c.setLocal("bits", c.i32_const(0)));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eqz(c.getLocal("aux"))
          ),
          c.setLocal(
            "aux",
            c.i32_shr_u(
              c.getLocal("aux"),
              c.i32_const(1)
            )
          ),
          c.setLocal(
            "bits",
            c.i32_add(
              c.getLocal("bits"),
              c.i32_const(1)
            )
          ),
          c.br(0)
        )));
        f2.addCode(c.if(
          c.i32_ne(
            c.getLocal("n"),
            c.i32_shl(
              c.i32_const(1),
              c.getLocal("bits")
            )
          ),
          c.unreachable()
        ));
        f2.addCode(c.if(
          c.i32_gt_u(
            c.getLocal("bits"),
            c.i32_const(maxBits)
          ),
          c.unreachable()
        ));
        f2.addCode(c.getLocal("bits"));
      }
      function buildFFT2() {
        const f2 = module3.addFunction(prefix + "_fft");
        f2.addParam("px", "i32");
        f2.addParam("n", "i32");
        f2.addParam("odd", "i32");
        f2.addLocal("bits", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal(
            "bits",
            c.call(
              prefix + "__log2",
              c.getLocal("n")
            )
          )
        );
        f2.addCode(c.call(
          prefix + "__rawfft",
          c.getLocal("px"),
          c.getLocal("bits"),
          c.getLocal("odd")
        ));
      }
      function buildIFFT() {
        const f2 = module3.addFunction(prefix + "_ifft");
        f2.addParam("px", "i32");
        f2.addParam("n", "i32");
        f2.addParam("odd", "i32");
        f2.addLocal("bits", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal(
            "bits",
            c.call(
              prefix + "__log2",
              c.getLocal("n")
            )
          )
        );
        f2.addCode(c.call(
          prefix + "__rawfft",
          c.getLocal("px"),
          c.getLocal("bits"),
          c.getLocal("odd")
        ));
        f2.addCode(c.call(
          prefix + "__finalInverse",
          c.getLocal("px"),
          c.getLocal("bits")
        ));
      }
      function buildRawFFT() {
        const f2 = module3.addFunction(prefix + "__rawfft");
        f2.addParam("px", "i32");
        f2.addParam("bits", "i32");
        f2.addParam("odd", "i32");
        f2.addLocal("s", "i32");
        f2.addLocal("k", "i32");
        f2.addLocal("j", "i32");
        f2.addLocal("m", "i32");
        f2.addLocal("mdiv2", "i32");
        f2.addLocal("n", "i32");
        f2.addLocal("pwm", "i32");
        f2.addLocal("idx1", "i32");
        f2.addLocal("idx2", "i32");
        const c = f2.getCodeBuilder();
        const W = c.i32_const(module3.alloc(n8));
        const T = c.i32_const(module3.alloc(n8));
        const U = c.i32_const(module3.alloc(n8));
        f2.addCode(
          c.call(prefix + "__reversePermutation", c.getLocal("px"), c.getLocal("bits")),
          c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
          c.setLocal("s", c.i32_const(1)),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_gt_u(
                c.getLocal("s"),
                c.getLocal("bits")
              )
            ),
            c.setLocal("m", c.i32_shl(c.i32_const(1), c.getLocal("s"))),
            c.setLocal(
              "pwm",
              c.i32_add(
                c.i32_const(ROOTs),
                c.i32_mul(
                  c.getLocal("s"),
                  c.i32_const(n8)
                )
              )
            ),
            c.setLocal("k", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_ge_u(
                  c.getLocal("k"),
                  c.getLocal("n")
                )
              ),
              c.if(
                c.getLocal("odd"),
                c.call(
                  f1mPrefix + "_copy",
                  c.i32_add(
                    c.getLocal("pwm"),
                    c.i32_const(n8)
                  ),
                  W
                ),
                c.call(f1mPrefix + "_one", W)
              ),
              c.setLocal("mdiv2", c.i32_shr_u(c.getLocal("m"), c.i32_const(1))),
              c.setLocal("j", c.i32_const(0)),
              c.block(c.loop(
                c.br_if(
                  1,
                  c.i32_ge_u(
                    c.getLocal("j"),
                    c.getLocal("mdiv2")
                  )
                ),
                c.setLocal(
                  "idx1",
                  c.i32_add(
                    c.getLocal("px"),
                    c.i32_mul(
                      c.i32_add(
                        c.getLocal("k"),
                        c.getLocal("j")
                      ),
                      c.i32_const(n8)
                    )
                  )
                ),
                c.setLocal(
                  "idx2",
                  c.i32_add(
                    c.getLocal("idx1"),
                    c.i32_mul(
                      c.getLocal("mdiv2"),
                      c.i32_const(n8)
                    )
                  )
                ),
                c.call(
                  f1mPrefix + "_mul",
                  W,
                  c.getLocal("idx2"),
                  T
                ),
                c.call(
                  f1mPrefix + "_copy",
                  c.getLocal("idx1"),
                  U
                ),
                c.call(
                  f1mPrefix + "_add",
                  U,
                  T,
                  c.getLocal("idx1")
                ),
                c.call(
                  f1mPrefix + "_sub",
                  U,
                  T,
                  c.getLocal("idx2")
                ),
                c.call(
                  f1mPrefix + "_mul",
                  W,
                  c.getLocal("pwm"),
                  W
                ),
                c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
                c.br(0)
              )),
              c.setLocal("k", c.i32_add(c.getLocal("k"), c.getLocal("m"))),
              c.br(0)
            )),
            c.setLocal("s", c.i32_add(c.getLocal("s"), c.i32_const(1))),
            c.br(0)
          ))
        );
      }
      function buildCopyInterleaved() {
        const f2 = module3.addFunction(prefix + "_copyNInterleaved");
        f2.addParam("ps", "i32");
        f2.addParam("pd", "i32");
        f2.addParam("n", "i32");
        f2.addLocal("pi", "i32");
        f2.addLocal("po", "i32");
        f2.addLocal("pn", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal("pi", c.getLocal("ps")),
          c.setLocal("po", c.getLocal("pd")),
          c.setLocal(
            "pn",
            c.i32_add(
              c.getLocal("ps"),
              c.i32_mul(
                c.getLocal("n"),
                c.i32_const(n8)
              )
            )
          ),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("pi"),
                c.getLocal("pn")
              )
            ),
            c.call(f1mPrefix + "_copy", c.getLocal("pi"), c.getLocal("po")),
            c.setLocal("pi", c.i32_add(c.getLocal("pi"), c.i32_const(n8))),
            c.setLocal("po", c.i32_add(c.getLocal("po"), c.i32_const(n8 * 2))),
            c.br(0)
          ))
        );
      }
      function buildToMontgomery() {
        const f2 = module3.addFunction(prefix + "_toMontgomeryN");
        f2.addParam("ps", "i32");
        f2.addParam("pd", "i32");
        f2.addParam("n", "i32");
        f2.addLocal("pi", "i32");
        f2.addLocal("po", "i32");
        f2.addLocal("pn", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal("pi", c.getLocal("ps")),
          c.setLocal("po", c.getLocal("pd")),
          c.setLocal(
            "pn",
            c.i32_add(
              c.getLocal("ps"),
              c.i32_mul(
                c.getLocal("n"),
                c.i32_const(n8)
              )
            )
          ),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("pi"),
                c.getLocal("pn")
              )
            ),
            c.call(f1mPrefix + "_toMontgomery", c.getLocal("pi"), c.getLocal("po")),
            c.setLocal("pi", c.i32_add(c.getLocal("pi"), c.i32_const(n8))),
            c.setLocal("po", c.i32_add(c.getLocal("po"), c.i32_const(n8))),
            c.br(0)
          ))
        );
      }
      function buildMulN() {
        const f2 = module3.addFunction(prefix + "_mulN");
        f2.addParam("px", "i32");
        f2.addParam("py", "i32");
        f2.addParam("n", "i32");
        f2.addParam("pd", "i32");
        f2.addLocal("pix", "i32");
        f2.addLocal("piy", "i32");
        f2.addLocal("po", "i32");
        f2.addLocal("lastpix", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal("pix", c.getLocal("px")),
          c.setLocal("piy", c.getLocal("py")),
          c.setLocal("po", c.getLocal("pd")),
          c.setLocal(
            "lastpix",
            c.i32_add(
              c.getLocal("px"),
              c.i32_mul(
                c.getLocal("n"),
                c.i32_const(n8)
              )
            )
          ),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("pix"),
                c.getLocal("lastpix")
              )
            ),
            c.call(f1mPrefix + "_mul", c.getLocal("pix"), c.getLocal("piy"), c.getLocal("po")),
            c.setLocal("pix", c.i32_add(c.getLocal("pix"), c.i32_const(n8))),
            c.setLocal("piy", c.i32_add(c.getLocal("piy"), c.i32_const(n8))),
            c.setLocal("po", c.i32_add(c.getLocal("po"), c.i32_const(n8))),
            c.br(0)
          ))
        );
      }
      function buildFromMontgomery() {
        const f2 = module3.addFunction(prefix + "_fromMontgomeryN");
        f2.addParam("ps", "i32");
        f2.addParam("pd", "i32");
        f2.addParam("n", "i32");
        f2.addLocal("pi", "i32");
        f2.addLocal("po", "i32");
        f2.addLocal("pn", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal("pi", c.getLocal("ps")),
          c.setLocal("po", c.getLocal("pd")),
          c.setLocal(
            "pn",
            c.i32_add(
              c.getLocal("ps"),
              c.i32_mul(
                c.getLocal("n"),
                c.i32_const(n8)
              )
            )
          ),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("pi"),
                c.getLocal("pn")
              )
            ),
            c.call(f1mPrefix + "_fromMontgomery", c.getLocal("pi"), c.getLocal("po")),
            c.setLocal("pi", c.i32_add(c.getLocal("pi"), c.i32_const(n8))),
            c.setLocal("po", c.i32_add(c.getLocal("po"), c.i32_const(n8))),
            c.br(0)
          ))
        );
      }
      function buildFinalInverse() {
        const f2 = module3.addFunction(prefix + "__finalInverse");
        f2.addParam("px", "i32");
        f2.addParam("bits", "i32");
        f2.addLocal("n", "i32");
        f2.addLocal("ndiv2", "i32");
        f2.addLocal("pInv2", "i32");
        f2.addLocal("i", "i32");
        f2.addLocal("mask", "i32");
        f2.addLocal("idx1", "i32");
        f2.addLocal("idx2", "i32");
        const c = f2.getCodeBuilder();
        const T = c.i32_const(module3.alloc(n8));
        f2.addCode(
          c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
          c.setLocal(
            "pInv2",
            c.i32_add(
              c.i32_const(INV2),
              c.i32_mul(
                c.getLocal("bits"),
                c.i32_const(n8)
              )
            )
          ),
          c.setLocal("mask", c.i32_sub(c.getLocal("n"), c.i32_const(1))),
          c.setLocal("i", c.i32_const(1)),
          c.setLocal(
            "ndiv2",
            c.i32_shr_u(
              c.getLocal("n"),
              c.i32_const(1)
            )
          ),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("i"),
                c.getLocal("ndiv2")
              )
            ),
            c.setLocal(
              "idx1",
              c.i32_add(
                c.getLocal("px"),
                c.i32_mul(
                  c.getLocal("i"),
                  c.i32_const(n8)
                )
              )
            ),
            c.setLocal(
              "idx2",
              c.i32_add(
                c.getLocal("px"),
                c.i32_mul(
                  c.i32_sub(
                    c.getLocal("n"),
                    c.getLocal("i")
                  ),
                  c.i32_const(n8)
                )
              )
            ),
            c.call(f1mPrefix + "_copy", c.getLocal("idx1"), T),
            c.call(f1mPrefix + "_mul", c.getLocal("idx2"), c.getLocal("pInv2"), c.getLocal("idx1")),
            c.call(f1mPrefix + "_mul", T, c.getLocal("pInv2"), c.getLocal("idx2")),
            //                c.call(f1mPrefix + "_mul", c.getLocal("idx1") , c.getLocal("pInv2"), c.getLocal("idx1") ),
            //                c.call(f1mPrefix + "_mul", c.getLocal("idx2") , c.getLocal("pInv2"), c.getLocal("idx1") ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          )),
          c.call(f1mPrefix + "_mul", c.getLocal("px"), c.getLocal("pInv2"), c.getLocal("px")),
          c.setLocal(
            "idx2",
            c.i32_add(
              c.getLocal("px"),
              c.i32_mul(
                c.getLocal("ndiv2"),
                c.i32_const(n8)
              )
            )
          ),
          c.call(f1mPrefix + "_mul", c.getLocal("idx2"), c.getLocal("pInv2"), c.getLocal("idx2"))
        );
      }
      function buildReversePermutation() {
        const f2 = module3.addFunction(prefix + "__reversePermutation");
        f2.addParam("px", "i32");
        f2.addParam("bits", "i32");
        f2.addLocal("n", "i32");
        f2.addLocal("i", "i32");
        f2.addLocal("ri", "i32");
        f2.addLocal("idx1", "i32");
        f2.addLocal("idx2", "i32");
        const c = f2.getCodeBuilder();
        const T = c.i32_const(module3.alloc(n8));
        f2.addCode(
          c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
          c.setLocal("i", c.i32_const(0)),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("i"),
                c.getLocal("n")
              )
            ),
            c.setLocal(
              "idx1",
              c.i32_add(
                c.getLocal("px"),
                c.i32_mul(
                  c.getLocal("i"),
                  c.i32_const(n8)
                )
              )
            ),
            c.setLocal("ri", c.call(prefix + "__rev", c.getLocal("i"), c.getLocal("bits"))),
            c.setLocal(
              "idx2",
              c.i32_add(
                c.getLocal("px"),
                c.i32_mul(
                  c.getLocal("ri"),
                  c.i32_const(n8)
                )
              )
            ),
            c.if(
              c.i32_lt_u(
                c.getLocal("i"),
                c.getLocal("ri")
              ),
              [
                ...c.call(f1mPrefix + "_copy", c.getLocal("idx1"), T),
                ...c.call(f1mPrefix + "_copy", c.getLocal("idx2"), c.getLocal("idx1")),
                ...c.call(f1mPrefix + "_copy", T, c.getLocal("idx2"))
              ]
            ),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          ))
        );
      }
      function buildRev() {
        const f2 = module3.addFunction(prefix + "__rev");
        f2.addParam("x", "i32");
        f2.addParam("bits", "i32");
        f2.setReturnType("i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.i32_rotl(
            c.i32_add(
              c.i32_add(
                c.i32_shl(
                  c.i32_load8_u(
                    c.i32_and(
                      c.getLocal("x"),
                      c.i32_const(255)
                    ),
                    REVTABLE,
                    0
                  ),
                  c.i32_const(24)
                ),
                c.i32_shl(
                  c.i32_load8_u(
                    c.i32_and(
                      c.i32_shr_u(
                        c.getLocal("x"),
                        c.i32_const(8)
                      ),
                      c.i32_const(255)
                    ),
                    REVTABLE,
                    0
                  ),
                  c.i32_const(16)
                )
              ),
              c.i32_add(
                c.i32_shl(
                  c.i32_load8_u(
                    c.i32_and(
                      c.i32_shr_u(
                        c.getLocal("x"),
                        c.i32_const(16)
                      ),
                      c.i32_const(255)
                    ),
                    REVTABLE,
                    0
                  ),
                  c.i32_const(8)
                ),
                c.i32_load8_u(
                  c.i32_and(
                    c.i32_shr_u(
                      c.getLocal("x"),
                      c.i32_const(24)
                    ),
                    c.i32_const(255)
                  ),
                  REVTABLE,
                  0
                )
              )
            ),
            c.getLocal("bits")
          )
        );
      }
      buildRev();
      buildReversePermutation();
      buildRawFFT();
      buildCopyInterleaved();
      buildFromMontgomery();
      buildToMontgomery();
      buildFinalInverse();
      buildLog2();
      buildFFT2();
      buildIFFT();
      buildMulN();
      module3.exportFunction(prefix + "_fft");
      module3.exportFunction(prefix + "_ifft");
      module3.exportFunction(prefix + "_toMontgomeryN");
      module3.exportFunction(prefix + "_fromMontgomeryN");
      module3.exportFunction(prefix + "_copyNInterleaved");
      module3.exportFunction(prefix + "_mulN");
    };
  }
});

// src/build_multiexp.js
var require_build_multiexp = __commonJS({
  "src/build_multiexp.js"(exports2, module2) {
    module2.exports = function buildMultiexp(module3, prefix, curvePrefix, pointFieldPrefix, scalarPrefix) {
      const pointFieldN64 = module3.modules[pointFieldPrefix].n64;
      const pointFieldN8 = pointFieldN64 * 8;
      const pointN64 = module3.modules[curvePrefix].n64;
      const pointN8 = pointN64 * 8;
      const scalarN64 = module3.modules[scalarPrefix].n64;
      const scalarN8 = scalarN64 * 8;
      function buildPackBits() {
        const f2 = module3.addFunction(prefix + "__packbits");
        f2.addParam("pscalars", "i32");
        f2.addParam("w", "i32");
        f2.addParam("pr", "i32");
        f2.addLocal("i", "i32");
        f2.addLocal("j", "i32");
        f2.addLocal("w1", "i64");
        f2.addLocal("w2", "i64");
        const c = f2.getCodeBuilder();
        f2.addCode(c.setLocal("i", c.i32_const(0)));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("i"),
              c.i32_const(scalarN8)
            )
          ),
          c.setLocal("w2", c.i64_const(0)),
          c.setLocal("j", c.i32_const(0)),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("j"),
                c.getLocal("w")
              )
            ),
            c.setLocal(
              "w1",
              c.i64_load8_u(
                c.i32_add(
                  c.getLocal("pscalars"),
                  c.i32_add(
                    c.i32_mul(
                      c.getLocal("j"),
                      c.i32_const(scalarN8)
                    ),
                    c.getLocal("i")
                  )
                )
              )
            ),
            c.setLocal(
              "w1",
              c.i64_and(
                c.i64_or(
                  c.getLocal("w1"),
                  c.i64_shl(
                    c.getLocal("w1"),
                    c.i64_const(28)
                  )
                ),
                c.i64_const("0x0000000F0000000F")
              )
            ),
            c.setLocal(
              "w1",
              c.i64_and(
                c.i64_or(
                  c.getLocal("w1"),
                  c.i64_shl(
                    c.getLocal("w1"),
                    c.i64_const(14)
                  )
                ),
                c.i64_const("0x0003000300030003")
              )
            ),
            c.setLocal(
              "w1",
              c.i64_and(
                c.i64_or(
                  c.getLocal("w1"),
                  c.i64_shl(
                    c.getLocal("w1"),
                    c.i64_const(7)
                  )
                ),
                c.i64_const("0x0101010101010101")
              )
            ),
            c.setLocal(
              "w2",
              c.i64_or(
                c.getLocal("w2"),
                c.i64_shl(
                  c.getLocal("w1"),
                  c.i64_extend_i32_u(c.getLocal("j"))
                )
              )
            ),
            c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
            c.br(0)
          )),
          c.i64_store(
            c.i32_add(
              c.getLocal("pr"),
              c.i32_mul(
                c.getLocal("i"),
                c.i32_const(8)
              )
            ),
            c.getLocal("w2")
          ),
          c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
          c.br(0)
        )));
      }
      const c1 = [];
      const c2 = [];
      function nbits(_b) {
        let c = 0;
        let r = _b;
        while (r) {
          if (r & 1) c++;
          r = r >> 1;
        }
        return c;
      }
      function split(_b) {
        const nb1 = nbits(_b) >> 1;
        let r = _b;
        let c = 0;
        if (nb1 == 0) return null;
        let mask = 4294967295;
        while (c < nb1) {
          if (r & 1) c++;
          mask = mask << 1;
          r = r >> 1;
        }
        return [_b & mask, _b & ~mask];
      }
      for (let i = 0; i < 256; i++) {
        const a = split(i);
        if (a) {
          c1[i] = a[0];
          c2[i] = a[1];
        } else {
          c1[i] = 0;
          c2[i] = 0;
        }
      }
      const ptable = module3.alloc(pointN8 * 256);
      const pset = module3.alloc(32);
      const composite1 = module3.alloc(256, c1);
      const composite2 = module3.alloc(256, c2);
      function buildSetSet() {
        const f2 = module3.addFunction(prefix + "__set_set");
        f2.addParam("idx", "i32");
        f2.addLocal("word", "i32");
        f2.addLocal("mask", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal(
            "word",
            c.i32_shl(
              c.i32_shr_u(
                c.getLocal("idx"),
                c.i32_const(5)
              ),
              c.i32_const(2)
            )
          )
        );
        f2.addCode(
          c.setLocal(
            "mask",
            c.i32_shl(
              c.i32_const(1),
              c.i32_and(
                c.getLocal("idx"),
                c.i32_const("0x1F")
              )
            )
          )
        );
        f2.addCode(
          c.i32_store(
            c.getLocal("word"),
            pset,
            c.i32_or(
              c.i32_load(
                c.getLocal("word"),
                pset
              ),
              c.getLocal("mask")
            )
          )
        );
      }
      function buildSetIsSet() {
        const f2 = module3.addFunction(prefix + "__set_isSet");
        f2.addParam("idx", "i32");
        f2.setReturnType("i32");
        f2.addLocal("word", "i32");
        f2.addLocal("mask", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal(
            "word",
            c.i32_shl(
              c.i32_shr_u(
                c.getLocal("idx"),
                c.i32_const(5)
              ),
              c.i32_const(2)
            )
          )
        );
        f2.addCode(
          c.setLocal(
            "mask",
            c.i32_shl(
              c.i32_const(1),
              c.i32_and(
                c.getLocal("idx"),
                c.i32_const("0x1F")
              )
            )
          )
        );
        f2.addCode(
          c.i32_and(
            c.i32_load(
              c.getLocal("word"),
              pset
            ),
            c.getLocal("mask")
          )
        );
      }
      function buildPTableReset() {
        const f2 = module3.addFunction(prefix + "__ptable_reset");
        f2.addParam("ppoints", "i32");
        f2.addParam("w", "i32");
        f2.addLocal("ps", "i32");
        f2.addLocal("pd", "i32");
        f2.addLocal("i", "i32");
        f2.addLocal("isZero", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.setLocal("ps", c.getLocal("ppoints")));
        f2.addCode(c.call(curvePrefix + "_zero", c.i32_const(ptable)));
        f2.addCode(c.setLocal("i", c.i32_const(0)));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("i"),
              c.getLocal("w")
            )
          ),
          c.setLocal(
            "pd",
            c.i32_add(
              c.i32_const(ptable),
              c.i32_mul(
                c.i32_shl(
                  c.i32_const(1),
                  c.getLocal("i")
                ),
                c.i32_const(pointN8)
              )
            )
          ),
          c.setLocal("isZero", c.call(pointFieldPrefix + "_isZero", c.getLocal("ps"))),
          c.call(pointFieldPrefix + "_copy", c.getLocal("ps"), c.getLocal("pd")),
          c.setLocal("ps", c.i32_add(c.getLocal("ps"), c.i32_const(pointFieldN8))),
          c.setLocal("pd", c.i32_add(c.getLocal("pd"), c.i32_const(pointFieldN8))),
          c.call(pointFieldPrefix + "_copy", c.getLocal("ps"), c.getLocal("pd")),
          c.setLocal("ps", c.i32_add(c.getLocal("ps"), c.i32_const(pointFieldN8))),
          c.setLocal("pd", c.i32_add(c.getLocal("pd"), c.i32_const(pointFieldN8))),
          c.if(
            c.getLocal("isZero"),
            c.call(pointFieldPrefix + "_zero", c.getLocal("pd")),
            c.call(pointFieldPrefix + "_one", c.getLocal("pd"))
          ),
          c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
          c.br(0)
        )));
        f2.addCode(c.i64_store(c.i32_const(pset), c.i64_const("0x0000000100010117")));
        f2.addCode(c.i64_store(c.i32_const(pset + 8), c.i64_const("0x0000000000000001")));
        f2.addCode(c.i64_store(c.i32_const(pset + 16), c.i64_const("0x0000000000000001")));
        f2.addCode(c.i64_store(c.i32_const(pset + 24), c.i64_const("0x0000000000000000")));
      }
      function buildPTableGet() {
        const f2 = module3.addFunction(prefix + "__ptable_get");
        f2.addParam("idx", "i32");
        f2.setReturnType("i32");
        f2.addLocal("pr", "i32");
        f2.addLocal("p1", "i32");
        f2.addLocal("p2", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal(
            "pr",
            c.i32_add(
              c.i32_const(ptable),
              c.i32_mul(
                c.getLocal("idx"),
                c.i32_const(pointN8)
              )
            )
          )
        );
        f2.addCode(c.if(
          c.i32_eqz(
            c.call(
              prefix + "__set_isSet",
              c.getLocal("idx")
            )
          ),
          [
            ...c.setLocal(
              "p1",
              c.call(
                prefix + "__ptable_get",
                c.i32_load8_u(
                  c.getLocal("idx"),
                  composite1
                )
              )
            ),
            ...c.setLocal(
              "p2",
              c.call(
                prefix + "__ptable_get",
                c.i32_load8_u(
                  c.getLocal("idx"),
                  composite2
                )
              )
            ),
            ...c.call(
              curvePrefix + "_add",
              c.getLocal("p1"),
              c.getLocal("p2"),
              c.getLocal("pr")
            ),
            ...c.call(
              prefix + "__set_set",
              c.getLocal("idx")
            )
          ]
        ));
        f2.addCode(c.getLocal("pr"));
      }
      function buildMulw() {
        const f2 = module3.addFunction(prefix + "__mulw");
        f2.addParam("pscalars", "i32");
        f2.addParam("ppoints", "i32");
        f2.addParam("w", "i32");
        f2.addParam("pr", "i32");
        f2.addLocal("i", "i32");
        const c = f2.getCodeBuilder();
        const psels = module3.alloc(scalarN8 * 8);
        f2.addCode(c.call(
          prefix + "__packbits",
          c.getLocal("pscalars"),
          c.getLocal("w"),
          c.i32_const(psels)
        ));
        f2.addCode(c.call(
          curvePrefix + "_zero",
          c.getLocal("pr")
        ));
        f2.addCode(c.call(
          prefix + "__ptable_reset",
          c.getLocal("ppoints"),
          c.getLocal("w")
        ));
        f2.addCode(c.setLocal("i", c.i32_const(0)));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("i"),
              c.i32_const(scalarN8 * 8)
            )
          ),
          c.call(
            curvePrefix + "_double",
            c.getLocal("pr"),
            c.getLocal("pr")
          ),
          c.call(
            curvePrefix + "_add",
            c.getLocal("pr"),
            c.call(
              prefix + "__ptable_get",
              c.i32_load8_u(
                c.i32_sub(
                  c.i32_const(psels + scalarN8 * 8 - 1),
                  c.getLocal("i")
                )
              )
            ),
            c.getLocal("pr")
          ),
          c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
          c.br(0)
        )));
      }
      function buildMultiexp2() {
        const f2 = module3.addFunction(prefix + "_multiexp");
        f2.addParam("pscalars", "i32");
        f2.addParam("ppoints", "i32");
        f2.addParam("n", "i32");
        f2.addParam("w", "i32");
        f2.addParam("pr", "i32");
        f2.addLocal("ps", "i32");
        f2.addLocal("pp", "i32");
        f2.addLocal("wf", "i32");
        f2.addLocal("lastps", "i32");
        const c = f2.getCodeBuilder();
        const aux = c.i32_const(module3.alloc(pointN8));
        f2.addCode(c.setLocal("ps", c.getLocal("pscalars")));
        f2.addCode(c.setLocal("pp", c.getLocal("ppoints")));
        f2.addCode(c.setLocal(
          "lastps",
          c.i32_add(
            c.getLocal("ps"),
            c.i32_mul(
              c.i32_mul(
                c.i32_div_u(
                  c.getLocal("n"),
                  c.getLocal("w")
                ),
                c.getLocal("w")
              ),
              c.i32_const(scalarN8)
            )
          )
        ));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("ps"),
              c.getLocal("lastps")
            )
          ),
          c.call(prefix + "__mulw", c.getLocal("ps"), c.getLocal("pp"), c.getLocal("w"), aux),
          c.call(curvePrefix + "_add", aux, c.getLocal("pr"), c.getLocal("pr")),
          c.setLocal(
            "ps",
            c.i32_add(
              c.getLocal("ps"),
              c.i32_mul(
                c.i32_const(scalarN8),
                c.getLocal("w")
              )
            )
          ),
          c.setLocal(
            "pp",
            c.i32_add(
              c.getLocal("pp"),
              c.i32_mul(
                c.i32_const(pointFieldN8 * 2),
                c.getLocal("w")
              )
            )
          ),
          c.br(0)
        )));
        f2.addCode(c.setLocal("wf", c.i32_rem_u(c.getLocal("n"), c.getLocal("w"))));
        f2.addCode(c.if(
          c.getLocal("wf"),
          [
            ...c.call(prefix + "__mulw", c.getLocal("ps"), c.getLocal("pp"), c.getLocal("wf"), aux),
            ...c.call(curvePrefix + "_add", aux, c.getLocal("pr"), c.getLocal("pr"))
          ]
        ));
      }
      function buildMulw2() {
        const f2 = module3.addFunction(prefix + "__mulw2");
        f2.addParam("pscalars", "i32");
        f2.addParam("ppoints", "i32");
        f2.addParam("w", "i32");
        f2.addParam("pr", "i32");
        f2.addLocal("i", "i32");
        f2.addLocal("pd", "i32");
        const c = f2.getCodeBuilder();
        const psels = module3.alloc(scalarN8 * 8);
        f2.addCode(c.call(
          prefix + "__packbits",
          c.getLocal("pscalars"),
          c.getLocal("w"),
          c.i32_const(psels)
        ));
        f2.addCode(c.call(
          prefix + "__ptable_reset",
          c.getLocal("ppoints"),
          c.getLocal("w")
        ));
        f2.addCode(c.setLocal("i", c.i32_const(0)));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("i"),
              c.i32_const(scalarN8 * 8)
            )
          ),
          c.setLocal(
            "pd",
            c.i32_add(
              c.getLocal("pr"),
              c.i32_mul(
                c.getLocal("i"),
                c.i32_const(pointN8)
              )
            )
          ),
          c.call(
            curvePrefix + "_add",
            c.getLocal("pd"),
            c.call(
              prefix + "__ptable_get",
              c.i32_load8_u(
                c.i32_sub(
                  c.i32_const(psels + scalarN8 * 8 - 1),
                  c.getLocal("i")
                )
              )
            ),
            c.getLocal("pd")
          ),
          c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
          c.br(0)
        )));
      }
      function buildMultiexp22() {
        const f2 = module3.addFunction(prefix + "_multiexp2");
        f2.addParam("pscalars", "i32");
        f2.addParam("ppoints", "i32");
        f2.addParam("n", "i32");
        f2.addParam("w", "i32");
        f2.addParam("pr", "i32");
        f2.addLocal("ps", "i32");
        f2.addLocal("pp", "i32");
        f2.addLocal("wf", "i32");
        f2.addLocal("lastps", "i32");
        const c = f2.getCodeBuilder();
        const accumulators = c.i32_const(module3.alloc(pointN8 * scalarN8 * 8));
        const aux = c.i32_const(module3.alloc(pointN8));
        f2.addCode(c.call(prefix + "__resetAccumulators", accumulators, c.i32_const(scalarN8 * 8)));
        f2.addCode(c.setLocal("ps", c.getLocal("pscalars")));
        f2.addCode(c.setLocal("pp", c.getLocal("ppoints")));
        f2.addCode(c.setLocal(
          "lastps",
          c.i32_add(
            c.getLocal("ps"),
            c.i32_mul(
              c.i32_mul(
                c.i32_div_u(
                  c.getLocal("n"),
                  c.getLocal("w")
                ),
                c.getLocal("w")
              ),
              c.i32_const(scalarN8)
            )
          )
        ));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("ps"),
              c.getLocal("lastps")
            )
          ),
          c.call(prefix + "__mulw2", c.getLocal("ps"), c.getLocal("pp"), c.getLocal("w"), accumulators),
          c.setLocal(
            "ps",
            c.i32_add(
              c.getLocal("ps"),
              c.i32_mul(
                c.i32_const(scalarN8),
                c.getLocal("w")
              )
            )
          ),
          c.setLocal(
            "pp",
            c.i32_add(
              c.getLocal("pp"),
              c.i32_mul(
                c.i32_const(pointFieldN8 * 2),
                c.getLocal("w")
              )
            )
          ),
          c.br(0)
        )));
        f2.addCode(c.setLocal("wf", c.i32_rem_u(c.getLocal("n"), c.getLocal("w"))));
        f2.addCode(c.if(
          c.getLocal("wf"),
          [
            ...c.call(prefix + "__mulw2", c.getLocal("ps"), c.getLocal("pp"), c.getLocal("wf"), accumulators)
          ]
        ));
        f2.addCode(c.call(
          prefix + "__addAccumulators",
          accumulators,
          c.i32_const(scalarN8 * 8),
          aux
        ));
        f2.addCode(c.call(curvePrefix + "_add", aux, c.getLocal("pr"), c.getLocal("pr")));
      }
      function buildResetAccumulators() {
        const f2 = module3.addFunction(prefix + "__resetAccumulators");
        f2.addParam("paccumulators", "i32");
        f2.addParam("n", "i32");
        f2.addLocal("i", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.setLocal("i", c.i32_const(0)));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("i"),
              c.getLocal("n")
            )
          ),
          c.call(
            curvePrefix + "_zero",
            c.i32_add(
              c.getLocal("paccumulators"),
              c.i32_mul(
                c.getLocal("i"),
                c.i32_const(pointN8)
              )
            )
          ),
          c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
          c.br(0)
        )));
      }
      function buildAddAccumulators() {
        const f2 = module3.addFunction(prefix + "__addAccumulators");
        f2.addParam("paccumulators", "i32");
        f2.addParam("n", "i32");
        f2.addParam("pr", "i32");
        f2.addLocal("i", "i32");
        f2.addLocal("p", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(c.setLocal("p", c.getLocal("paccumulators")));
        f2.addCode(c.call(curvePrefix + "_copy", c.getLocal("p"), c.getLocal("pr")));
        f2.addCode(c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(pointN8))));
        f2.addCode(c.setLocal("i", c.i32_const(1)));
        f2.addCode(c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("i"),
              c.getLocal("n")
            )
          ),
          c.call(
            curvePrefix + "_double",
            c.getLocal("pr"),
            c.getLocal("pr")
          ),
          c.call(
            curvePrefix + "_add",
            c.getLocal("p"),
            c.getLocal("pr"),
            c.getLocal("pr")
          ),
          c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(pointN8))),
          c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
          c.br(0)
        )));
      }
      buildSetSet();
      buildSetIsSet();
      buildPTableReset();
      buildPTableGet();
      buildPackBits();
      buildMulw();
      buildMultiexp2();
      buildMulw2();
      buildResetAccumulators();
      buildAddAccumulators();
      buildMultiexp22();
      module3.exportFunction(prefix + "_multiexp");
      module3.exportFunction(prefix + "_multiexp2");
    };
  }
});

// src/build_pol.js
var require_build_pol = __commonJS({
  "src/build_pol.js"(exports2, module2) {
    module2.exports = function buildPol(module3, prefix, prefixField) {
      const n64 = module3.modules[prefixField].n64;
      const n8 = n64 * 8;
      function buildZero() {
        const f2 = module3.addFunction(prefix + "_zero");
        f2.addParam("px", "i32");
        f2.addParam("n", "i32");
        f2.addLocal("lastp", "i32");
        f2.addLocal("p", "i32");
        const c = f2.getCodeBuilder();
        f2.addCode(
          c.setLocal("p", c.getLocal("px")),
          c.setLocal(
            "lastp",
            c.i32_add(
              c.getLocal("px"),
              c.i32_mul(
                c.getLocal("n"),
                c.i32_const(n8)
              )
            )
          ),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("p"),
                c.getLocal("lastp")
              )
            ),
            c.call(prefixField + "_zero", c.getLocal("p")),
            c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(n8))),
            c.br(0)
          ))
        );
      }
      function buildConstructLC() {
        const f2 = module3.addFunction(prefix + "_constructLC");
        f2.addParam("ppolynomials", "i32");
        f2.addParam("psignals", "i32");
        f2.addParam("nSignals", "i32");
        f2.addParam("pres", "i32");
        f2.addLocal("i", "i32");
        f2.addLocal("j", "i32");
        f2.addLocal("pp", "i32");
        f2.addLocal("ps", "i32");
        f2.addLocal("pd", "i32");
        f2.addLocal("ncoefs", "i32");
        const c = f2.getCodeBuilder();
        const aux = c.i32_const(module3.alloc(n8));
        f2.addCode(
          c.setLocal("i", c.i32_const(0)),
          c.setLocal("pp", c.getLocal("ppolynomials")),
          c.setLocal("ps", c.getLocal("psignals")),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_eq(
                c.getLocal("i"),
                c.getLocal("nSignals")
              )
            ),
            c.setLocal("ncoefs", c.i32_load(c.getLocal("pp"))),
            c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(4))),
            c.setLocal("j", c.i32_const(0)),
            c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("j"),
                  c.getLocal("ncoefs")
                )
              ),
              c.setLocal(
                "pd",
                c.i32_add(
                  c.getLocal("pres"),
                  c.i32_mul(
                    c.i32_load(c.getLocal("pp")),
                    c.i32_const(n8)
                  )
                )
              ),
              c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(4))),
              c.call(
                prefixField + "_mul",
                c.getLocal("ps"),
                c.getLocal("pp"),
                aux
              ),
              c.call(
                prefixField + "_add",
                aux,
                c.getLocal("pd"),
                c.getLocal("pd")
              ),
              c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(n8))),
              c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
              c.br(0)
            )),
            c.setLocal("ps", c.i32_add(c.getLocal("ps"), c.i32_const(n8))),
            c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
            c.br(0)
          ))
        );
      }
      buildZero();
      buildConstructLC();
      module3.exportFunction(prefix + "_zero");
      module3.exportFunction(prefix + "_constructLC");
      return prefix;
    };
  }
});

// src/bn128.js
var require_bn128 = __commonJS({
  "src/bn128.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var ModuleBuilder = require_wasmbuilder();
    var buildF1m = require_build_f1m();
    var buildF2m = require_build_f2m();
    var buildF1 = require_build_f1();
    var buildCurve = require_build_curve();
    var buildTest = require_build_testg1();
    var buildFFT = require_build_fft();
    var buildMultiexp = require_build_multiexp();
    var buildPol = require_build_pol();
    var utils = require_utils2();
    async function build() {
      const bn128 = new Bn128();
      bn128.q = bigInt2("21888242871839275222246405745257275088696311157297823662689037894645226208583");
      bn128.r = bigInt2("21888242871839275222246405745257275088548364400416034343698204186575808495617");
      bn128.n64 = Math.floor((bn128.q.minus(1).bitLength() - 1) / 64) + 1;
      bn128.n32 = bn128.n64 * 2;
      bn128.n8 = bn128.n64 * 8;
      bn128.memory = new WebAssembly.Memory({ initial: 1e4 });
      bn128.i32 = new Uint32Array(bn128.memory.buffer);
      const moduleBuilder = new ModuleBuilder();
      moduleBuilder.setMemory(1e4);
      buildF1m(moduleBuilder, bn128.q, "f1m");
      buildF1(moduleBuilder, bn128.r, "fr", "frm");
      buildCurve(moduleBuilder, "g1", "f1m");
      buildMultiexp(moduleBuilder, "g1", "g1", "f1m", "fr");
      buildFFT(moduleBuilder, "fft", "frm", bigInt2(7));
      buildPol(moduleBuilder, "pol", "frm");
      const pNonResidueF2 = moduleBuilder.alloc(
        utils.bigInt2BytesLE(
          bigInt2("15537367993719455909907449462855742678907882278146377936676643359958227611562"),
          // -1 in montgomery
          bn128.n8
        )
      );
      buildF2m(moduleBuilder, pNonResidueF2, "f2m", "f1m");
      buildCurve(moduleBuilder, "g2", "f2m");
      buildMultiexp(moduleBuilder, "g2", "g2", "f2m", "fr");
      buildTest(moduleBuilder);
      const code = moduleBuilder.build();
      const wasmModule = await WebAssembly.compile(code);
      bn128.instance = await WebAssembly.instantiate(wasmModule, {
        env: {
          "memory": bn128.memory
        }
      });
      bn128.pq = moduleBuilder.modules.f1m.pq;
      bn128.pr = moduleBuilder.modules.frm.pq;
      bn128.pg1 = bn128.g1_allocPoint([bigInt2(1), bigInt2(2), bigInt2(1)]);
      Object.assign(bn128, bn128.instance.exports);
      return bn128;
    }
    var Bn128 = class {
      constructor() {
      }
      alloc(length) {
        while (this.i32[0] & 3) this.i32[0]++;
        const res = this.i32[0];
        this.i32[0] += length;
        return res;
      }
      putInt(pos, _a) {
        const a = bigInt2(_a);
        if (pos & 7) throw new Error("Pointer must be aligned");
        if (a.bitLength > this.n64 * 64) {
          return this.putInt(a.mod(this.q));
        }
        for (let i = 0; i < this.n32; i++) {
          this.i32[(pos >> 2) + i] = a.shiftRight(i * 32).and(4294967295).toJSNumber();
        }
      }
      getInt(pos) {
        if (pos & 7) throw new Error("Pointer must be aligned");
        let acc = bigInt2(this.i32[(pos >> 2) + this.n32 - 1]);
        for (let i = this.n32 - 2; i >= 0; i--) {
          acc = acc.shiftLeft(32);
          acc = acc.add(this.i32[(pos >> 2) + i]);
        }
        return acc;
      }
      allocInt(_a) {
        const p = this.alloc(this.n8);
        if (_a) this.putInt(p, _a);
        return p;
      }
      putIntF2(pos, a) {
        this.putInt(pos, a[0]);
        this.putInt(pos + this.n8, a[1]);
      }
      getIntF2(pos) {
        const p = Array(2);
        p[0] = this.getInt(pos);
        p[1] = this.getInt(pos + this.n8);
        return p;
      }
      allocIntF2(a) {
        const pP = this.alloc(this.n8 * 2);
        if (a) {
          this.putIntF2(pP, a);
        }
        return pP;
      }
      g1_putPoint(pos, p) {
        this.putInt(pos, p[0]);
        this.putInt(pos + this.n8, p[1]);
        if (p.length == 3) {
          this.putInt(pos + this.n8 * 2, p[2]);
        } else {
          this.putInt(pos + this.n8 * 2, 1);
        }
      }
      g1_getPoint(pos) {
        const p = Array(3);
        p[0] = this.getInt(pos);
        p[1] = this.getInt(pos + this.n8);
        p[2] = this.getInt(pos + this.n8 * 2);
        return p;
      }
      g1_allocPoint(p) {
        const pP = this.alloc(this.n8 * 3);
        if (p) {
          this.g1_putPoint(pP, p);
        }
        return pP;
      }
      g2_putPoint(pos, p) {
        this.putIntF2(pos, p[0]);
        this.putIntF2(pos + this.n8 * 2, p[1]);
        if (p.length == 3) {
          this.putIntF2(pos + this.n8 * 4, p[2]);
        } else {
          this.putIntF2(pos + this.n8 * 4, 1);
        }
      }
      g2_getPoint(pos) {
        const p = Array(3);
        p[0] = this.getIntF2(pos);
        p[1] = this.getIntF2(pos + this.n8 * 2);
        p[2] = this.getIntF2(pos + this.n8 * 4);
        return p;
      }
      g2_allocPoint(p) {
        const pP = this.alloc(this.n8 * 6);
        if (p) {
          this.g2_putPoint(pP, p);
        }
        return pP;
      }
      putBin(b) {
        const p = this.alloc(b.byteLength);
        const s32 = new Uint32Array(b);
        this.i32.set(s32, p / 4);
        return p;
      }
      test_AddG1(n) {
        const start = (/* @__PURE__ */ new Date()).getTime();
        const pg = this.g1_allocPoint([bigInt2(1), bigInt2(2), bigInt2(1)]);
        this.g1_toMontgomery(pg, pg);
        const p2 = this.g1_allocPoint();
        this.instance.exports.testAddG1(n, pg, p2);
        this.g1_fromMontgomery(p2, p2);
        const end = (/* @__PURE__ */ new Date()).getTime();
        const time = end - start;
        return time;
      }
      test_fft(n) {
        const N = n;
        const p = this.i32[0];
        for (let i = 0; i < N; i++) {
          this.putInt(p + i * 32, i);
        }
        const start = (/* @__PURE__ */ new Date()).getTime();
        this.fft_ifft(p, N);
        const end = (/* @__PURE__ */ new Date()).getTime();
        const time = end - start;
        return time;
      }
    };
    module2.exports = build;
  }
});

// build/groth16_wasm.js
var require_groth16_wasm = __commonJS({
  "build/groth16_wasm.js"(exports2) {
    exports2.code = Uint8Array.from(atob("AGFzbQEAAAABPApgAn9/AGABfwBgAX8Bf2ACf38Bf2ADf39/AX9gA39/fwBgA39+fwBgAn9+AGAEf39/fwBgBX9/f39/AAIQAQNlbnYGbWVtb3J5AgDoBwNsawABAgEDAwQEBQUGBwgFBQUAAAUFAAAAAQUFAAAFBQAAAAEFAAIBAAAFAAUAAAAIAQIAAgUICQgABQkDAAUFBQUAAgUFCAAIAgEBAAUFBQAAAAMAAgEAAAUABQAAAAgBAgACBQgJCAAFCQgIB8gJYghpbnRfY29weQAACGludF96ZXJvAAEHaW50X29uZQADCmludF9pc1plcm8AAgZpbnRfZXEABAdpbnRfZ3RlAAUHaW50X2FkZAAGB2ludF9zdWIABwppbnRfbXVsT2xkAAkHaW50X211bAAIB2ludF9kaXYADA5pbnRfaW52ZXJzZU1vZAANB2YxbV9hZGQADgdmMW1fc3ViAA8HZjFtX25lZwAQC2YxbV9tUmVkdWN0ABEHZjFtX211bAASCmYxbV9tdWxPbGQAExJmMW1fZnJvbU1vbnRnb21lcnkAFRBmMW1fdG9Nb250Z29tZXJ5ABQLZjFtX2ludmVyc2UAFghmMW1fY29weQAACGYxbV96ZXJvAAEKZjFtX2lzWmVybwACBmYxbV9lcQAEB2YxbV9vbmUAFwdmcm1fYWRkABgHZnJtX3N1YgAZB2ZybV9uZWcAGgtmcm1fbVJlZHVjdAAbB2ZybV9tdWwAHApmcm1fbXVsT2xkAB0SZnJtX2Zyb21Nb250Z29tZXJ5AB8QZnJtX3RvTW9udGdvbWVyeQAeC2ZybV9pbnZlcnNlACAIZnJtX2NvcHkAAAhmcm1femVybwABCmZybV9pc1plcm8AAgZmcm1fZXEABAdmcm1fb25lACEGZnJfYWRkABgGZnJfc3ViABkGZnJfbmVnABoGZnJfbXVsACIKZnJfaW52ZXJzZQAjB2ZyX2NvcHkAAAdmcl96ZXJvAAEGZnJfb25lACEJZnJfaXNaZXJvAAIFZnJfZXEABAlnMV9pc1plcm8AJAdnMV9jb3B5ACYHZzFfemVybwAlCWcxX2RvdWJsZQAnBmcxX2FkZAAoBmcxX25lZwApBmcxX3N1YgAqEWcxX2Zyb21Nb250Z29tZXJ5ACsPZzFfdG9Nb250Z29tZXJ5ACwJZzFfYWZmaW5lAC0OZzFfdGltZXNTY2FsYXIALgtnMV9tdWx0aWV4cAA1DGcxX211bHRpZXhwMgA5B2ZmdF9mZnQAQghmZnRfaWZmdABDEWZmdF90b01vbnRnb21lcnlOAD8TZmZ0X2Zyb21Nb250Z29tZXJ5TgA+FGZmdF9jb3B5TkludGVybGVhdmVkAD0IZmZ0X211bE4ARAhwb2xfemVybwBFD3BvbF9jb25zdHJ1Y3RMQwBGCmYybV9pc1plcm8ARwhmMm1femVybwBIB2YybV9vbmUASQhmMm1fY29weQBKB2YybV9tdWwASwdmMm1fYWRkAEwHZjJtX3N1YgBNB2YybV9uZWcAThJmMm1fZnJvbU1vbnRnb21lcnkAUBBmMm1fdG9Nb250Z29tZXJ5AE8GZjJtX2VxAFELZjJtX2ludmVyc2UAUglnMl9pc1plcm8AUwdnMl9jb3B5AFUHZzJfemVybwBUCWcyX2RvdWJsZQBWBmcyX2FkZABXBmcyX25lZwBYBmcyX3N1YgBZEWcyX2Zyb21Nb250Z29tZXJ5AFoPZzJfdG9Nb250Z29tZXJ5AFsJZzJfYWZmaW5lAFwOZzJfdGltZXNTY2FsYXIAXQtnMl9tdWx0aWV4cABkDGcyX211bHRpZXhwMgBoDHRlc3RfZjFtX211bABpD3Rlc3RfZjFtX211bE9sZABqCsfEAWsqACABIAApAwA3AwAgASAAKQMINwMIIAEgACkDEDcDECABIAApAxg3AxgLHgAgAEIANwMAIABCADcDCCAAQgA3AxAgAEIANwMYCzMAIAApAxhQBEAgACkDEFAEQCAAKQMIUARAIAApAwBQDwVBAA8LBUEADwsFQQAPC0EADwseACAAQgE3AwAgAEIANwMIIABCADcDECAAQgA3AxgLRwAgACkDGCABKQMYUQRAIAApAxAgASkDEFEEQCAAKQMIIAEpAwhRBEAgACkDACABKQMAUQ8FQQAPCwVBAA8LBUEADwtBAA8LfQAgACkDGCABKQMYVARAQQAPBSAAKQMYIAEpAxhWBEBBAQ8FIAApAxAgASkDEFQEQEEADwUgACkDECABKQMQVgRAQQEPBSAAKQMIIAEpAwhUBEBBAA8FIAApAwggASkDCFYEQEEBDwUgACkDACABKQMAWg8LCwsLCwtBAA8L1AEBAX4gADUCACABNQIAfCEDIAIgAz4CACAANQIEIAE1AgR8IANCIIh8IQMgAiADPgIEIAA1AgggATUCCHwgA0IgiHwhAyACIAM+AgggADUCDCABNQIMfCADQiCIfCEDIAIgAz4CDCAANQIQIAE1AhB8IANCIIh8IQMgAiADPgIQIAA1AhQgATUCFHwgA0IgiHwhAyACIAM+AhQgADUCGCABNQIYfCADQiCIfCEDIAIgAz4CGCAANQIcIAE1Ahx8IANCIIh8IQMgAiADPgIcIANCIIinC4wCAQF+IAA1AgAgATUCAH0hAyACIANC/////w+DPgIAIAA1AgQgATUCBH0gA0Igh3whAyACIANC/////w+DPgIEIAA1AgggATUCCH0gA0Igh3whAyACIANC/////w+DPgIIIAA1AgwgATUCDH0gA0Igh3whAyACIANC/////w+DPgIMIAA1AhAgATUCEH0gA0Igh3whAyACIANC/////w+DPgIQIAA1AhQgATUCFH0gA0Igh3whAyACIANC/////w+DPgIUIAA1AhggATUCGH0gA0Igh3whAyACIANC/////w+DPgIYIAA1AhwgATUCHH0gA0Igh3whAyACIANC/////w+DPgIcIANCIIenC48QEgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfiADQv////8PgyAANQIAIgUgATUCACIGfnwhAyAEIANCIIh8IQQgAiADPgIAIARCIIghAyAEQv////8PgyAFIAE1AgQiCH58IQQgAyAEQiCIfCEDIARC/////w+DIAA1AgQiByAGfnwhBCADIARCIIh8IQMgAiAEPgIEIANCIIghBCADQv////8PgyAFIAE1AggiCn58IQMgBCADQiCIfCEEIANC/////w+DIAcgCH58IQMgBCADQiCIfCEEIANC/////w+DIAA1AggiCSAGfnwhAyAEIANCIIh8IQQgAiADPgIIIARCIIghAyAEQv////8PgyAFIAE1AgwiDH58IQQgAyAEQiCIfCEDIARC/////w+DIAcgCn58IQQgAyAEQiCIfCEDIARC/////w+DIAkgCH58IQQgAyAEQiCIfCEDIARC/////w+DIAA1AgwiCyAGfnwhBCADIARCIIh8IQMgAiAEPgIMIANCIIghBCADQv////8PgyAFIAE1AhAiDn58IQMgBCADQiCIfCEEIANC/////w+DIAcgDH58IQMgBCADQiCIfCEEIANC/////w+DIAkgCn58IQMgBCADQiCIfCEEIANC/////w+DIAsgCH58IQMgBCADQiCIfCEEIANC/////w+DIAA1AhAiDSAGfnwhAyAEIANCIIh8IQQgAiADPgIQIARCIIghAyAEQv////8PgyAFIAE1AhQiEH58IQQgAyAEQiCIfCEDIARC/////w+DIAcgDn58IQQgAyAEQiCIfCEDIARC/////w+DIAkgDH58IQQgAyAEQiCIfCEDIARC/////w+DIAsgCn58IQQgAyAEQiCIfCEDIARC/////w+DIA0gCH58IQQgAyAEQiCIfCEDIARC/////w+DIAA1AhQiDyAGfnwhBCADIARCIIh8IQMgAiAEPgIUIANCIIghBCADQv////8PgyAFIAE1AhgiEn58IQMgBCADQiCIfCEEIANC/////w+DIAcgEH58IQMgBCADQiCIfCEEIANC/////w+DIAkgDn58IQMgBCADQiCIfCEEIANC/////w+DIAsgDH58IQMgBCADQiCIfCEEIANC/////w+DIA0gCn58IQMgBCADQiCIfCEEIANC/////w+DIA8gCH58IQMgBCADQiCIfCEEIANC/////w+DIAA1AhgiESAGfnwhAyAEIANCIIh8IQQgAiADPgIYIARCIIghAyAEQv////8PgyAFIAE1AhwiFH58IQQgAyAEQiCIfCEDIARC/////w+DIAcgEn58IQQgAyAEQiCIfCEDIARC/////w+DIAkgEH58IQQgAyAEQiCIfCEDIARC/////w+DIAsgDn58IQQgAyAEQiCIfCEDIARC/////w+DIA0gDH58IQQgAyAEQiCIfCEDIARC/////w+DIA8gCn58IQQgAyAEQiCIfCEDIARC/////w+DIBEgCH58IQQgAyAEQiCIfCEDIARC/////w+DIAA1AhwiEyAGfnwhBCADIARCIIh8IQMgAiAEPgIcIANCIIghBCADQv////8PgyAHIBR+fCEDIAQgA0IgiHwhBCADQv////8PgyAJIBJ+fCEDIAQgA0IgiHwhBCADQv////8PgyALIBB+fCEDIAQgA0IgiHwhBCADQv////8PgyANIA5+fCEDIAQgA0IgiHwhBCADQv////8PgyAPIAx+fCEDIAQgA0IgiHwhBCADQv////8PgyARIAp+fCEDIAQgA0IgiHwhBCADQv////8PgyATIAh+fCEDIAQgA0IgiHwhBCACIAM+AiAgBEIgiCEDIARC/////w+DIAkgFH58IQQgAyAEQiCIfCEDIARC/////w+DIAsgEn58IQQgAyAEQiCIfCEDIARC/////w+DIA0gEH58IQQgAyAEQiCIfCEDIARC/////w+DIA8gDn58IQQgAyAEQiCIfCEDIARC/////w+DIBEgDH58IQQgAyAEQiCIfCEDIARC/////w+DIBMgCn58IQQgAyAEQiCIfCEDIAIgBD4CJCADQiCIIQQgA0L/////D4MgCyAUfnwhAyAEIANCIIh8IQQgA0L/////D4MgDSASfnwhAyAEIANCIIh8IQQgA0L/////D4MgDyAQfnwhAyAEIANCIIh8IQQgA0L/////D4MgESAOfnwhAyAEIANCIIh8IQQgA0L/////D4MgEyAMfnwhAyAEIANCIIh8IQQgAiADPgIoIARCIIghAyAEQv////8PgyANIBR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAPIBJ+fCEEIAMgBEIgiHwhAyAEQv////8PgyARIBB+fCEEIAMgBEIgiHwhAyAEQv////8PgyATIA5+fCEEIAMgBEIgiHwhAyACIAQ+AiwgA0IgiCEEIANC/////w+DIA8gFH58IQMgBCADQiCIfCEEIANC/////w+DIBEgEn58IQMgBCADQiCIfCEEIANC/////w+DIBMgEH58IQMgBCADQiCIfCEEIAIgAz4CMCAEQiCIIQMgBEL/////D4MgESAUfnwhBCADIARCIIh8IQMgBEL/////D4MgEyASfnwhBCADIARCIIh8IQMgAiAEPgI0IANCIIghBCADQv////8PgyATIBR+fCEDIAQgA0IgiHwhBCACIAM+AjggBEIgiCEDIAIgBD4CPAv0EAEBfkEoIAA1AgAgATUCAH43AwBBKCAANQIAIAE1AgR+NwMIQSggADUCACABNQIIfjcDEEEoIAA1AgAgATUCDH43AxhBKCAANQIAIAE1AhB+NwMgQSggADUCACABNQIUfjcDKEEoIAA1AgAgATUCGH43AzBBKCAANQIAIAE1Ahx+NwM4QSggADUCBCABNQIAfjcDQEEoIAA1AgQgATUCBH43A0hBKCAANQIEIAE1Agh+NwNQQSggADUCBCABNQIMfjcDWEEoIAA1AgQgATUCEH43A2BBKCAANQIEIAE1AhR+NwNoQSggADUCBCABNQIYfjcDcEEoIAA1AgQgATUCHH43A3hBKCAANQIIIAE1AgB+NwOAAUEoIAA1AgggATUCBH43A4gBQSggADUCCCABNQIIfjcDkAFBKCAANQIIIAE1Agx+NwOYAUEoIAA1AgggATUCEH43A6ABQSggADUCCCABNQIUfjcDqAFBKCAANQIIIAE1Ahh+NwOwAUEoIAA1AgggATUCHH43A7gBQSggADUCDCABNQIAfjcDwAFBKCAANQIMIAE1AgR+NwPIAUEoIAA1AgwgATUCCH43A9ABQSggADUCDCABNQIMfjcD2AFBKCAANQIMIAE1AhB+NwPgAUEoIAA1AgwgATUCFH43A+gBQSggADUCDCABNQIYfjcD8AFBKCAANQIMIAE1Ahx+NwP4AUEoIAA1AhAgATUCAH43A4ACQSggADUCECABNQIEfjcDiAJBKCAANQIQIAE1Agh+NwOQAkEoIAA1AhAgATUCDH43A5gCQSggADUCECABNQIQfjcDoAJBKCAANQIQIAE1AhR+NwOoAkEoIAA1AhAgATUCGH43A7ACQSggADUCECABNQIcfjcDuAJBKCAANQIUIAE1AgB+NwPAAkEoIAA1AhQgATUCBH43A8gCQSggADUCFCABNQIIfjcD0AJBKCAANQIUIAE1Agx+NwPYAkEoIAA1AhQgATUCEH43A+ACQSggADUCFCABNQIUfjcD6AJBKCAANQIUIAE1Ahh+NwPwAkEoIAA1AhQgATUCHH43A/gCQSggADUCGCABNQIAfjcDgANBKCAANQIYIAE1AgR+NwOIA0EoIAA1AhggATUCCH43A5ADQSggADUCGCABNQIMfjcDmANBKCAANQIYIAE1AhB+NwOgA0EoIAA1AhggATUCFH43A6gDQSggADUCGCABNQIYfjcDsANBKCAANQIYIAE1Ahx+NwO4A0EoIAA1AhwgATUCAH43A8ADQSggADUCHCABNQIEfjcDyANBKCAANQIcIAE1Agh+NwPQA0EoIAA1AhwgATUCDH43A9gDQSggADUCHCABNQIQfjcD4ANBKCAANQIcIAE1AhR+NwPoA0EoIAA1AhwgATUCGH43A/ADQSggADUCHCABNQIcfjcD+AMgA0IgiEEoNQIAfCEDIAIgAz4CACADQiCIQSg1AgR8QSg1Agh8QSg1AkB8IQMgAiADPgIEIANCIIhBKDUCDHxBKDUCRHxBKDUCEHxBKDUCSHxBKDUCgAF8IQMgAiADPgIIIANCIIhBKDUCFHxBKDUCTHxBKDUChAF8QSg1Ahh8QSg1AlB8QSg1AogBfEEoNQLAAXwhAyACIAM+AgwgA0IgiEEoNQIcfEEoNQJUfEEoNQKMAXxBKDUCxAF8QSg1AiB8QSg1Alh8QSg1ApABfEEoNQLIAXxBKDUCgAJ8IQMgAiADPgIQIANCIIhBKDUCJHxBKDUCXHxBKDUClAF8QSg1AswBfEEoNQKEAnxBKDUCKHxBKDUCYHxBKDUCmAF8QSg1AtABfEEoNQKIAnxBKDUCwAJ8IQMgAiADPgIUIANCIIhBKDUCLHxBKDUCZHxBKDUCnAF8QSg1AtQBfEEoNQKMAnxBKDUCxAJ8QSg1AjB8QSg1Amh8QSg1AqABfEEoNQLYAXxBKDUCkAJ8QSg1AsgCfEEoNQKAA3whAyACIAM+AhggA0IgiEEoNQI0fEEoNQJsfEEoNQKkAXxBKDUC3AF8QSg1ApQCfEEoNQLMAnxBKDUChAN8QSg1Ajh8QSg1AnB8QSg1AqgBfEEoNQLgAXxBKDUCmAJ8QSg1AtACfEEoNQKIA3xBKDUCwAN8IQMgAiADPgIcIANCIIhBKDUCPHxBKDUCdHxBKDUCrAF8QSg1AuQBfEEoNQKcAnxBKDUC1AJ8QSg1AowDfEEoNQLEA3xBKDUCeHxBKDUCsAF8QSg1AugBfEEoNQKgAnxBKDUC2AJ8QSg1ApADfEEoNQLIA3whAyACIAM+AiAgA0IgiEEoNQJ8fEEoNQK0AXxBKDUC7AF8QSg1AqQCfEEoNQLcAnxBKDUClAN8QSg1AswDfEEoNQK4AXxBKDUC8AF8QSg1AqgCfEEoNQLgAnxBKDUCmAN8QSg1AtADfCEDIAIgAz4CJCADQiCIQSg1ArwBfEEoNQL0AXxBKDUCrAJ8QSg1AuQCfEEoNQKcA3xBKDUC1AN8QSg1AvgBfEEoNQKwAnxBKDUC6AJ8QSg1AqADfEEoNQLYA3whAyACIAM+AiggA0IgiEEoNQL8AXxBKDUCtAJ8QSg1AuwCfEEoNQKkA3xBKDUC3AN8QSg1ArgCfEEoNQLwAnxBKDUCqAN8QSg1AuADfCEDIAIgAz4CLCADQiCIQSg1ArwCfEEoNQL0AnxBKDUCrAN8QSg1AuQDfEEoNQL4AnxBKDUCsAN8QSg1AugDfCEDIAIgAz4CMCADQiCIQSg1AvwCfEEoNQK0A3xBKDUC7AN8QSg1ArgDfEEoNQLwA3whAyACIAM+AjQgA0IgiEEoNQK8A3xBKDUC9AN8QSg1AvgDfCEDIAIgAz4COCADQiCIQSg1AvwDfCEDIAIgAz4CPAu2AQEBfiAANQAAIAF+IQMgAiADPgAAIAA1AAQgAX4gA0IgiHwhAyACIAM+AAQgADUACCABfiADQiCIfCEDIAIgAz4ACCAANQAMIAF+IANCIIh8IQMgAiADPgAMIAA1ABAgAX4gA0IgiHwhAyACIAM+ABAgADUAFCABfiADQiCIfCEDIAIgAz4AFCAANQAYIAF+IANCIIh8IQMgAiADPgAYIAA1ABwgAX4gA0IgiHwhAyACIAM+ABwLTgIBfgF/IAAhAyADNQAAIAF8IQIgAyACPgAAIAJCIIghAgJAA0AgAlANASADQQRqIQMgAzUAACACfCECIAMgAj4AACACQiCIIQIMAAsLC7ACBwF/AX8BfwF/AX4BfgF/IAIEQCACIQUFQcgEIQULIAMEQCADIQQFQegEIQQLIAAgBBAAIAFBqAQQACAFEAFBiAUQAUEfIQZBHyEHAkADQEGoBCAHai0AACAHQQNGcg0BIAdBAWshBwwACwtBqAQgB2pBA2s1AABCAXwhCCAIQgFRBEBCAEIAgBoLAkADQAJAA0AgBCAGai0AACAGQQdGcg0BIAZBAWshBgwACwsgBCAGakEHaykAACEJIAkgCIAhCSAGIAdrQQRrIQoCQANAIAlCgICAgHCDUCAKQQBOcQ0BIAlCCIghCSAKQQFqIQoMAAsLIAlQBEAgBEGoBBAFRQ0CQgEhCUEAIQoLQagEIAlBqAUQCiAEQagFIAprIAQQBxogBSAKaiAJEAsMAAsLC7UCCwF/AX8BfwF/AX8BfwF/AX8BfwF/AX9ByAUhA0HIBRABQQAhC0HoBSEFIAFB6AUQAEGIBiEEQYgGEANBACEMQagGIQggAEGoBhAAQcgGIQZB6AYhB0HIByEKAkADQCAIEAINASAFIAggBiAHEAwgBiAEQYgHEAggCwRAIAwEQEGIByADEAUEQEGIByADIAoQBxpBACENBSADQYgHIAoQBxpBASENCwVBiAcgAyAKEAYaQQEhDQsFIAwEQEGIByADIAoQBhpBACENBSADQYgHEAUEQCADQYgHIAoQBxpBACENBUGIByADIAoQBxpBASENCwsLIAMhCSAEIQMgCiEEIAkhCiAMIQsgDSEMIAUhCSAIIQUgByEIIAkhBwwACwsgCwRAIAEgAyACEAcaBSADIAIQAAsLLAAgACABIAIQBgRAIAJB6AcgAhAHGgUgAkHoBxAFBEAgAkHoByACEAcaCwsLFwAgACABIAIQBwRAIAJB6AcgAhAGGgsLFAAgABACRQRAQegHIAAgARAHGgsLnBEDAX4BfgF+QonHmaQOIQJCACEDIAA1AgAgAn5C/////w+DIQQgADUCACADQiCIfEHoBzUCACAEfnwhAyAAIAM+AgAgADUCBCADQiCIfEHoBzUCBCAEfnwhAyAAIAM+AgQgADUCCCADQiCIfEHoBzUCCCAEfnwhAyAAIAM+AgggADUCDCADQiCIfEHoBzUCDCAEfnwhAyAAIAM+AgwgADUCECADQiCIfEHoBzUCECAEfnwhAyAAIAM+AhAgADUCFCADQiCIfEHoBzUCFCAEfnwhAyAAIAM+AhQgADUCGCADQiCIfEHoBzUCGCAEfnwhAyAAIAM+AhggADUCHCADQiCIfEHoBzUCHCAEfnwhAyAAIAM+AhxB6AggA0IgiD4CAEIAIQMgADUCBCACfkL/////D4MhBCAANQIEIANCIIh8QegHNQIAIAR+fCEDIAAgAz4CBCAANQIIIANCIIh8QegHNQIEIAR+fCEDIAAgAz4CCCAANQIMIANCIIh8QegHNQIIIAR+fCEDIAAgAz4CDCAANQIQIANCIIh8QegHNQIMIAR+fCEDIAAgAz4CECAANQIUIANCIIh8QegHNQIQIAR+fCEDIAAgAz4CFCAANQIYIANCIIh8QegHNQIUIAR+fCEDIAAgAz4CGCAANQIcIANCIIh8QegHNQIYIAR+fCEDIAAgAz4CHCAANQIgIANCIIh8QegHNQIcIAR+fCEDIAAgAz4CIEHoCCADQiCIPgIEQgAhAyAANQIIIAJ+Qv////8PgyEEIAA1AgggA0IgiHxB6Ac1AgAgBH58IQMgACADPgIIIAA1AgwgA0IgiHxB6Ac1AgQgBH58IQMgACADPgIMIAA1AhAgA0IgiHxB6Ac1AgggBH58IQMgACADPgIQIAA1AhQgA0IgiHxB6Ac1AgwgBH58IQMgACADPgIUIAA1AhggA0IgiHxB6Ac1AhAgBH58IQMgACADPgIYIAA1AhwgA0IgiHxB6Ac1AhQgBH58IQMgACADPgIcIAA1AiAgA0IgiHxB6Ac1AhggBH58IQMgACADPgIgIAA1AiQgA0IgiHxB6Ac1AhwgBH58IQMgACADPgIkQegIIANCIIg+AghCACEDIAA1AgwgAn5C/////w+DIQQgADUCDCADQiCIfEHoBzUCACAEfnwhAyAAIAM+AgwgADUCECADQiCIfEHoBzUCBCAEfnwhAyAAIAM+AhAgADUCFCADQiCIfEHoBzUCCCAEfnwhAyAAIAM+AhQgADUCGCADQiCIfEHoBzUCDCAEfnwhAyAAIAM+AhggADUCHCADQiCIfEHoBzUCECAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoBzUCFCAEfnwhAyAAIAM+AiAgADUCJCADQiCIfEHoBzUCGCAEfnwhAyAAIAM+AiQgADUCKCADQiCIfEHoBzUCHCAEfnwhAyAAIAM+AihB6AggA0IgiD4CDEIAIQMgADUCECACfkL/////D4MhBCAANQIQIANCIIh8QegHNQIAIAR+fCEDIAAgAz4CECAANQIUIANCIIh8QegHNQIEIAR+fCEDIAAgAz4CFCAANQIYIANCIIh8QegHNQIIIAR+fCEDIAAgAz4CGCAANQIcIANCIIh8QegHNQIMIAR+fCEDIAAgAz4CHCAANQIgIANCIIh8QegHNQIQIAR+fCEDIAAgAz4CICAANQIkIANCIIh8QegHNQIUIAR+fCEDIAAgAz4CJCAANQIoIANCIIh8QegHNQIYIAR+fCEDIAAgAz4CKCAANQIsIANCIIh8QegHNQIcIAR+fCEDIAAgAz4CLEHoCCADQiCIPgIQQgAhAyAANQIUIAJ+Qv////8PgyEEIAA1AhQgA0IgiHxB6Ac1AgAgBH58IQMgACADPgIUIAA1AhggA0IgiHxB6Ac1AgQgBH58IQMgACADPgIYIAA1AhwgA0IgiHxB6Ac1AgggBH58IQMgACADPgIcIAA1AiAgA0IgiHxB6Ac1AgwgBH58IQMgACADPgIgIAA1AiQgA0IgiHxB6Ac1AhAgBH58IQMgACADPgIkIAA1AiggA0IgiHxB6Ac1AhQgBH58IQMgACADPgIoIAA1AiwgA0IgiHxB6Ac1AhggBH58IQMgACADPgIsIAA1AjAgA0IgiHxB6Ac1AhwgBH58IQMgACADPgIwQegIIANCIIg+AhRCACEDIAA1AhggAn5C/////w+DIQQgADUCGCADQiCIfEHoBzUCACAEfnwhAyAAIAM+AhggADUCHCADQiCIfEHoBzUCBCAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoBzUCCCAEfnwhAyAAIAM+AiAgADUCJCADQiCIfEHoBzUCDCAEfnwhAyAAIAM+AiQgADUCKCADQiCIfEHoBzUCECAEfnwhAyAAIAM+AiggADUCLCADQiCIfEHoBzUCFCAEfnwhAyAAIAM+AiwgADUCMCADQiCIfEHoBzUCGCAEfnwhAyAAIAM+AjAgADUCNCADQiCIfEHoBzUCHCAEfnwhAyAAIAM+AjRB6AggA0IgiD4CGEIAIQMgADUCHCACfkL/////D4MhBCAANQIcIANCIIh8QegHNQIAIAR+fCEDIAAgAz4CHCAANQIgIANCIIh8QegHNQIEIAR+fCEDIAAgAz4CICAANQIkIANCIIh8QegHNQIIIAR+fCEDIAAgAz4CJCAANQIoIANCIIh8QegHNQIMIAR+fCEDIAAgAz4CKCAANQIsIANCIIh8QegHNQIQIAR+fCEDIAAgAz4CLCAANQIwIANCIIh8QegHNQIUIAR+fCEDIAAgAz4CMCAANQI0IANCIIh8QegHNQIYIAR+fCEDIAAgAz4CNCAANQI4IANCIIh8QegHNQIcIAR+fCEDIAAgAz4COEHoCCADQiCIPgIcQegIIABBIGogARAOC74fIwF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX5CiceZpA4hBSADQv////8PgyAANQIAIgYgATUCACIHfnwhAyAEIANCIIh8IQQgA0L/////D4MgBX5C/////w+DIQggA0L/////D4NBADUC6AciCSAIfnwhAyAEIANCIIh8IQQgBEIgiCEDIARC/////w+DIAYgATUCBCILfnwhBCADIARCIIh8IQMgBEL/////D4MgADUCBCIKIAd+fCEEIAMgBEIgiHwhAyAEQv////8Pg0EANQLsByINIAh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAFfkL/////D4MhDCAEQv////8PgyAJIAx+fCEEIAMgBEIgiHwhAyADQiCIIQQgA0L/////D4MgBiABNQIIIg9+fCEDIAQgA0IgiHwhBCADQv////8PgyAKIAt+fCEDIAQgA0IgiHwhBCADQv////8PgyAANQIIIg4gB358IQMgBCADQiCIfCEEIANC/////w+DIA0gDH58IQMgBCADQiCIfCEEIANC/////w+DQQA1AvAHIhEgCH58IQMgBCADQiCIfCEEIANC/////w+DIAV+Qv////8PgyEQIANC/////w+DIAkgEH58IQMgBCADQiCIfCEEIARCIIghAyAEQv////8PgyAGIAE1AgwiE358IQQgAyAEQiCIfCEDIARC/////w+DIAogD358IQQgAyAEQiCIfCEDIARC/////w+DIA4gC358IQQgAyAEQiCIfCEDIARC/////w+DIAA1AgwiEiAHfnwhBCADIARCIIh8IQMgBEL/////D4MgDSAQfnwhBCADIARCIIh8IQMgBEL/////D4MgESAMfnwhBCADIARCIIh8IQMgBEL/////D4NBADUC9AciFSAIfnwhBCADIARCIIh8IQMgBEL/////D4MgBX5C/////w+DIRQgBEL/////D4MgCSAUfnwhBCADIARCIIh8IQMgA0IgiCEEIANC/////w+DIAYgATUCECIXfnwhAyAEIANCIIh8IQQgA0L/////D4MgCiATfnwhAyAEIANCIIh8IQQgA0L/////D4MgDiAPfnwhAyAEIANCIIh8IQQgA0L/////D4MgEiALfnwhAyAEIANCIIh8IQQgA0L/////D4MgADUCECIWIAd+fCEDIAQgA0IgiHwhBCADQv////8PgyANIBR+fCEDIAQgA0IgiHwhBCADQv////8PgyARIBB+fCEDIAQgA0IgiHwhBCADQv////8PgyAVIAx+fCEDIAQgA0IgiHwhBCADQv////8Pg0EANQL4ByIZIAh+fCEDIAQgA0IgiHwhBCADQv////8PgyAFfkL/////D4MhGCADQv////8PgyAJIBh+fCEDIAQgA0IgiHwhBCAEQiCIIQMgBEL/////D4MgBiABNQIUIht+fCEEIAMgBEIgiHwhAyAEQv////8PgyAKIBd+fCEEIAMgBEIgiHwhAyAEQv////8PgyAOIBN+fCEEIAMgBEIgiHwhAyAEQv////8PgyASIA9+fCEEIAMgBEIgiHwhAyAEQv////8PgyAWIAt+fCEEIAMgBEIgiHwhAyAEQv////8PgyAANQIUIhogB358IQQgAyAEQiCIfCEDIARC/////w+DIA0gGH58IQQgAyAEQiCIfCEDIARC/////w+DIBEgFH58IQQgAyAEQiCIfCEDIARC/////w+DIBUgEH58IQQgAyAEQiCIfCEDIARC/////w+DIBkgDH58IQQgAyAEQiCIfCEDIARC/////w+DQQA1AvwHIh0gCH58IQQgAyAEQiCIfCEDIARC/////w+DIAV+Qv////8PgyEcIARC/////w+DIAkgHH58IQQgAyAEQiCIfCEDIANCIIghBCADQv////8PgyAGIAE1AhgiH358IQMgBCADQiCIfCEEIANC/////w+DIAogG358IQMgBCADQiCIfCEEIANC/////w+DIA4gF358IQMgBCADQiCIfCEEIANC/////w+DIBIgE358IQMgBCADQiCIfCEEIANC/////w+DIBYgD358IQMgBCADQiCIfCEEIANC/////w+DIBogC358IQMgBCADQiCIfCEEIANC/////w+DIAA1AhgiHiAHfnwhAyAEIANCIIh8IQQgA0L/////D4MgDSAcfnwhAyAEIANCIIh8IQQgA0L/////D4MgESAYfnwhAyAEIANCIIh8IQQgA0L/////D4MgFSAUfnwhAyAEIANCIIh8IQQgA0L/////D4MgGSAQfnwhAyAEIANCIIh8IQQgA0L/////D4MgHSAMfnwhAyAEIANCIIh8IQQgA0L/////D4NBADUCgAgiISAIfnwhAyAEIANCIIh8IQQgA0L/////D4MgBX5C/////w+DISAgA0L/////D4MgCSAgfnwhAyAEIANCIIh8IQQgBEIgiCEDIARC/////w+DIAYgATUCHCIjfnwhBCADIARCIIh8IQMgBEL/////D4MgCiAffnwhBCADIARCIIh8IQMgBEL/////D4MgDiAbfnwhBCADIARCIIh8IQMgBEL/////D4MgEiAXfnwhBCADIARCIIh8IQMgBEL/////D4MgFiATfnwhBCADIARCIIh8IQMgBEL/////D4MgGiAPfnwhBCADIARCIIh8IQMgBEL/////D4MgHiALfnwhBCADIARCIIh8IQMgBEL/////D4MgADUCHCIiIAd+fCEEIAMgBEIgiHwhAyAEQv////8PgyANICB+fCEEIAMgBEIgiHwhAyAEQv////8PgyARIBx+fCEEIAMgBEIgiHwhAyAEQv////8PgyAVIBh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAZIBR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAdIBB+fCEEIAMgBEIgiHwhAyAEQv////8PgyAhIAx+fCEEIAMgBEIgiHwhAyAEQv////8Pg0EANQKECCIlIAh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAFfkL/////D4MhJCAEQv////8PgyAJICR+fCEEIAMgBEIgiHwhAyADQiCIIQQgA0L/////D4MgCiAjfnwhAyAEIANCIIh8IQQgA0L/////D4MgDiAffnwhAyAEIANCIIh8IQQgA0L/////D4MgEiAbfnwhAyAEIANCIIh8IQQgA0L/////D4MgFiAXfnwhAyAEIANCIIh8IQQgA0L/////D4MgGiATfnwhAyAEIANCIIh8IQQgA0L/////D4MgHiAPfnwhAyAEIANCIIh8IQQgA0L/////D4MgIiALfnwhAyAEIANCIIh8IQQgA0L/////D4MgDSAkfnwhAyAEIANCIIh8IQQgA0L/////D4MgESAgfnwhAyAEIANCIIh8IQQgA0L/////D4MgFSAcfnwhAyAEIANCIIh8IQQgA0L/////D4MgGSAYfnwhAyAEIANCIIh8IQQgA0L/////D4MgHSAUfnwhAyAEIANCIIh8IQQgA0L/////D4MgISAQfnwhAyAEIANCIIh8IQQgA0L/////D4MgJSAMfnwhAyAEIANCIIh8IQQgAiADPgIAIARCIIghAyAEQv////8PgyAOICN+fCEEIAMgBEIgiHwhAyAEQv////8PgyASIB9+fCEEIAMgBEIgiHwhAyAEQv////8PgyAWIBt+fCEEIAMgBEIgiHwhAyAEQv////8PgyAaIBd+fCEEIAMgBEIgiHwhAyAEQv////8PgyAeIBN+fCEEIAMgBEIgiHwhAyAEQv////8PgyAiIA9+fCEEIAMgBEIgiHwhAyAEQv////8PgyARICR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAVICB+fCEEIAMgBEIgiHwhAyAEQv////8PgyAZIBx+fCEEIAMgBEIgiHwhAyAEQv////8PgyAdIBh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAhIBR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAlIBB+fCEEIAMgBEIgiHwhAyACIAQ+AgQgA0IgiCEEIANC/////w+DIBIgI358IQMgBCADQiCIfCEEIANC/////w+DIBYgH358IQMgBCADQiCIfCEEIANC/////w+DIBogG358IQMgBCADQiCIfCEEIANC/////w+DIB4gF358IQMgBCADQiCIfCEEIANC/////w+DICIgE358IQMgBCADQiCIfCEEIANC/////w+DIBUgJH58IQMgBCADQiCIfCEEIANC/////w+DIBkgIH58IQMgBCADQiCIfCEEIANC/////w+DIB0gHH58IQMgBCADQiCIfCEEIANC/////w+DICEgGH58IQMgBCADQiCIfCEEIANC/////w+DICUgFH58IQMgBCADQiCIfCEEIAIgAz4CCCAEQiCIIQMgBEL/////D4MgFiAjfnwhBCADIARCIIh8IQMgBEL/////D4MgGiAffnwhBCADIARCIIh8IQMgBEL/////D4MgHiAbfnwhBCADIARCIIh8IQMgBEL/////D4MgIiAXfnwhBCADIARCIIh8IQMgBEL/////D4MgGSAkfnwhBCADIARCIIh8IQMgBEL/////D4MgHSAgfnwhBCADIARCIIh8IQMgBEL/////D4MgISAcfnwhBCADIARCIIh8IQMgBEL/////D4MgJSAYfnwhBCADIARCIIh8IQMgAiAEPgIMIANCIIghBCADQv////8PgyAaICN+fCEDIAQgA0IgiHwhBCADQv////8PgyAeIB9+fCEDIAQgA0IgiHwhBCADQv////8PgyAiIBt+fCEDIAQgA0IgiHwhBCADQv////8PgyAdICR+fCEDIAQgA0IgiHwhBCADQv////8PgyAhICB+fCEDIAQgA0IgiHwhBCADQv////8PgyAlIBx+fCEDIAQgA0IgiHwhBCACIAM+AhAgBEIgiCEDIARC/////w+DIB4gI358IQQgAyAEQiCIfCEDIARC/////w+DICIgH358IQQgAyAEQiCIfCEDIARC/////w+DICEgJH58IQQgAyAEQiCIfCEDIARC/////w+DICUgIH58IQQgAyAEQiCIfCEDIAIgBD4CFCADQiCIIQQgA0L/////D4MgIiAjfnwhAyAEIANCIIh8IQQgA0L/////D4MgJSAkfnwhAyAEIANCIIh8IQQgAiADPgIYIARCIIghAyACIAQ+AhwgA6cEQCACQegHIAIQBxoFIAJB6AcQBQRAIAJB6AcgAhAHGgsLCxIAIAAgAUHoDBAJQegMIAIQEQsLACAAQYgIIAEQEgsVACAAQagNEABByA0QAUGoDSABEBELFwAgACABEBUgAUHoByABEA0gASABEBQLCQBBqAggABAACywAIAAgASACEAYEQCACQegNIAIQBxoFIAJB6A0QBQRAIAJB6A0gAhAHGgsLCxcAIAAgASACEAcEQCACQegNIAIQBhoLCxQAIAAQAkUEQEHoDSAAIAEQBxoLC5wRAwF+AX4BfkL/////DiECQgAhAyAANQIAIAJ+Qv////8PgyEEIAA1AgAgA0IgiHxB6A01AgAgBH58IQMgACADPgIAIAA1AgQgA0IgiHxB6A01AgQgBH58IQMgACADPgIEIAA1AgggA0IgiHxB6A01AgggBH58IQMgACADPgIIIAA1AgwgA0IgiHxB6A01AgwgBH58IQMgACADPgIMIAA1AhAgA0IgiHxB6A01AhAgBH58IQMgACADPgIQIAA1AhQgA0IgiHxB6A01AhQgBH58IQMgACADPgIUIAA1AhggA0IgiHxB6A01AhggBH58IQMgACADPgIYIAA1AhwgA0IgiHxB6A01AhwgBH58IQMgACADPgIcQegOIANCIIg+AgBCACEDIAA1AgQgAn5C/////w+DIQQgADUCBCADQiCIfEHoDTUCACAEfnwhAyAAIAM+AgQgADUCCCADQiCIfEHoDTUCBCAEfnwhAyAAIAM+AgggADUCDCADQiCIfEHoDTUCCCAEfnwhAyAAIAM+AgwgADUCECADQiCIfEHoDTUCDCAEfnwhAyAAIAM+AhAgADUCFCADQiCIfEHoDTUCECAEfnwhAyAAIAM+AhQgADUCGCADQiCIfEHoDTUCFCAEfnwhAyAAIAM+AhggADUCHCADQiCIfEHoDTUCGCAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoDTUCHCAEfnwhAyAAIAM+AiBB6A4gA0IgiD4CBEIAIQMgADUCCCACfkL/////D4MhBCAANQIIIANCIIh8QegNNQIAIAR+fCEDIAAgAz4CCCAANQIMIANCIIh8QegNNQIEIAR+fCEDIAAgAz4CDCAANQIQIANCIIh8QegNNQIIIAR+fCEDIAAgAz4CECAANQIUIANCIIh8QegNNQIMIAR+fCEDIAAgAz4CFCAANQIYIANCIIh8QegNNQIQIAR+fCEDIAAgAz4CGCAANQIcIANCIIh8QegNNQIUIAR+fCEDIAAgAz4CHCAANQIgIANCIIh8QegNNQIYIAR+fCEDIAAgAz4CICAANQIkIANCIIh8QegNNQIcIAR+fCEDIAAgAz4CJEHoDiADQiCIPgIIQgAhAyAANQIMIAJ+Qv////8PgyEEIAA1AgwgA0IgiHxB6A01AgAgBH58IQMgACADPgIMIAA1AhAgA0IgiHxB6A01AgQgBH58IQMgACADPgIQIAA1AhQgA0IgiHxB6A01AgggBH58IQMgACADPgIUIAA1AhggA0IgiHxB6A01AgwgBH58IQMgACADPgIYIAA1AhwgA0IgiHxB6A01AhAgBH58IQMgACADPgIcIAA1AiAgA0IgiHxB6A01AhQgBH58IQMgACADPgIgIAA1AiQgA0IgiHxB6A01AhggBH58IQMgACADPgIkIAA1AiggA0IgiHxB6A01AhwgBH58IQMgACADPgIoQegOIANCIIg+AgxCACEDIAA1AhAgAn5C/////w+DIQQgADUCECADQiCIfEHoDTUCACAEfnwhAyAAIAM+AhAgADUCFCADQiCIfEHoDTUCBCAEfnwhAyAAIAM+AhQgADUCGCADQiCIfEHoDTUCCCAEfnwhAyAAIAM+AhggADUCHCADQiCIfEHoDTUCDCAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoDTUCECAEfnwhAyAAIAM+AiAgADUCJCADQiCIfEHoDTUCFCAEfnwhAyAAIAM+AiQgADUCKCADQiCIfEHoDTUCGCAEfnwhAyAAIAM+AiggADUCLCADQiCIfEHoDTUCHCAEfnwhAyAAIAM+AixB6A4gA0IgiD4CEEIAIQMgADUCFCACfkL/////D4MhBCAANQIUIANCIIh8QegNNQIAIAR+fCEDIAAgAz4CFCAANQIYIANCIIh8QegNNQIEIAR+fCEDIAAgAz4CGCAANQIcIANCIIh8QegNNQIIIAR+fCEDIAAgAz4CHCAANQIgIANCIIh8QegNNQIMIAR+fCEDIAAgAz4CICAANQIkIANCIIh8QegNNQIQIAR+fCEDIAAgAz4CJCAANQIoIANCIIh8QegNNQIUIAR+fCEDIAAgAz4CKCAANQIsIANCIIh8QegNNQIYIAR+fCEDIAAgAz4CLCAANQIwIANCIIh8QegNNQIcIAR+fCEDIAAgAz4CMEHoDiADQiCIPgIUQgAhAyAANQIYIAJ+Qv////8PgyEEIAA1AhggA0IgiHxB6A01AgAgBH58IQMgACADPgIYIAA1AhwgA0IgiHxB6A01AgQgBH58IQMgACADPgIcIAA1AiAgA0IgiHxB6A01AgggBH58IQMgACADPgIgIAA1AiQgA0IgiHxB6A01AgwgBH58IQMgACADPgIkIAA1AiggA0IgiHxB6A01AhAgBH58IQMgACADPgIoIAA1AiwgA0IgiHxB6A01AhQgBH58IQMgACADPgIsIAA1AjAgA0IgiHxB6A01AhggBH58IQMgACADPgIwIAA1AjQgA0IgiHxB6A01AhwgBH58IQMgACADPgI0QegOIANCIIg+AhhCACEDIAA1AhwgAn5C/////w+DIQQgADUCHCADQiCIfEHoDTUCACAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoDTUCBCAEfnwhAyAAIAM+AiAgADUCJCADQiCIfEHoDTUCCCAEfnwhAyAAIAM+AiQgADUCKCADQiCIfEHoDTUCDCAEfnwhAyAAIAM+AiggADUCLCADQiCIfEHoDTUCECAEfnwhAyAAIAM+AiwgADUCMCADQiCIfEHoDTUCFCAEfnwhAyAAIAM+AjAgADUCNCADQiCIfEHoDTUCGCAEfnwhAyAAIAM+AjQgADUCOCADQiCIfEHoDTUCHCAEfnwhAyAAIAM+AjhB6A4gA0IgiD4CHEHoDiAAQSBqIAEQGAu+HyMBfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+Qv////8OIQUgA0L/////D4MgADUCACIGIAE1AgAiB358IQMgBCADQiCIfCEEIANC/////w+DIAV+Qv////8PgyEIIANC/////w+DQQA1AugNIgkgCH58IQMgBCADQiCIfCEEIARCIIghAyAEQv////8PgyAGIAE1AgQiC358IQQgAyAEQiCIfCEDIARC/////w+DIAA1AgQiCiAHfnwhBCADIARCIIh8IQMgBEL/////D4NBADUC7A0iDSAIfnwhBCADIARCIIh8IQMgBEL/////D4MgBX5C/////w+DIQwgBEL/////D4MgCSAMfnwhBCADIARCIIh8IQMgA0IgiCEEIANC/////w+DIAYgATUCCCIPfnwhAyAEIANCIIh8IQQgA0L/////D4MgCiALfnwhAyAEIANCIIh8IQQgA0L/////D4MgADUCCCIOIAd+fCEDIAQgA0IgiHwhBCADQv////8PgyANIAx+fCEDIAQgA0IgiHwhBCADQv////8Pg0EANQLwDSIRIAh+fCEDIAQgA0IgiHwhBCADQv////8PgyAFfkL/////D4MhECADQv////8PgyAJIBB+fCEDIAQgA0IgiHwhBCAEQiCIIQMgBEL/////D4MgBiABNQIMIhN+fCEEIAMgBEIgiHwhAyAEQv////8PgyAKIA9+fCEEIAMgBEIgiHwhAyAEQv////8PgyAOIAt+fCEEIAMgBEIgiHwhAyAEQv////8PgyAANQIMIhIgB358IQQgAyAEQiCIfCEDIARC/////w+DIA0gEH58IQQgAyAEQiCIfCEDIARC/////w+DIBEgDH58IQQgAyAEQiCIfCEDIARC/////w+DQQA1AvQNIhUgCH58IQQgAyAEQiCIfCEDIARC/////w+DIAV+Qv////8PgyEUIARC/////w+DIAkgFH58IQQgAyAEQiCIfCEDIANCIIghBCADQv////8PgyAGIAE1AhAiF358IQMgBCADQiCIfCEEIANC/////w+DIAogE358IQMgBCADQiCIfCEEIANC/////w+DIA4gD358IQMgBCADQiCIfCEEIANC/////w+DIBIgC358IQMgBCADQiCIfCEEIANC/////w+DIAA1AhAiFiAHfnwhAyAEIANCIIh8IQQgA0L/////D4MgDSAUfnwhAyAEIANCIIh8IQQgA0L/////D4MgESAQfnwhAyAEIANCIIh8IQQgA0L/////D4MgFSAMfnwhAyAEIANCIIh8IQQgA0L/////D4NBADUC+A0iGSAIfnwhAyAEIANCIIh8IQQgA0L/////D4MgBX5C/////w+DIRggA0L/////D4MgCSAYfnwhAyAEIANCIIh8IQQgBEIgiCEDIARC/////w+DIAYgATUCFCIbfnwhBCADIARCIIh8IQMgBEL/////D4MgCiAXfnwhBCADIARCIIh8IQMgBEL/////D4MgDiATfnwhBCADIARCIIh8IQMgBEL/////D4MgEiAPfnwhBCADIARCIIh8IQMgBEL/////D4MgFiALfnwhBCADIARCIIh8IQMgBEL/////D4MgADUCFCIaIAd+fCEEIAMgBEIgiHwhAyAEQv////8PgyANIBh+fCEEIAMgBEIgiHwhAyAEQv////8PgyARIBR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAVIBB+fCEEIAMgBEIgiHwhAyAEQv////8PgyAZIAx+fCEEIAMgBEIgiHwhAyAEQv////8Pg0EANQL8DSIdIAh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAFfkL/////D4MhHCAEQv////8PgyAJIBx+fCEEIAMgBEIgiHwhAyADQiCIIQQgA0L/////D4MgBiABNQIYIh9+fCEDIAQgA0IgiHwhBCADQv////8PgyAKIBt+fCEDIAQgA0IgiHwhBCADQv////8PgyAOIBd+fCEDIAQgA0IgiHwhBCADQv////8PgyASIBN+fCEDIAQgA0IgiHwhBCADQv////8PgyAWIA9+fCEDIAQgA0IgiHwhBCADQv////8PgyAaIAt+fCEDIAQgA0IgiHwhBCADQv////8PgyAANQIYIh4gB358IQMgBCADQiCIfCEEIANC/////w+DIA0gHH58IQMgBCADQiCIfCEEIANC/////w+DIBEgGH58IQMgBCADQiCIfCEEIANC/////w+DIBUgFH58IQMgBCADQiCIfCEEIANC/////w+DIBkgEH58IQMgBCADQiCIfCEEIANC/////w+DIB0gDH58IQMgBCADQiCIfCEEIANC/////w+DQQA1AoAOIiEgCH58IQMgBCADQiCIfCEEIANC/////w+DIAV+Qv////8PgyEgIANC/////w+DIAkgIH58IQMgBCADQiCIfCEEIARCIIghAyAEQv////8PgyAGIAE1AhwiI358IQQgAyAEQiCIfCEDIARC/////w+DIAogH358IQQgAyAEQiCIfCEDIARC/////w+DIA4gG358IQQgAyAEQiCIfCEDIARC/////w+DIBIgF358IQQgAyAEQiCIfCEDIARC/////w+DIBYgE358IQQgAyAEQiCIfCEDIARC/////w+DIBogD358IQQgAyAEQiCIfCEDIARC/////w+DIB4gC358IQQgAyAEQiCIfCEDIARC/////w+DIAA1AhwiIiAHfnwhBCADIARCIIh8IQMgBEL/////D4MgDSAgfnwhBCADIARCIIh8IQMgBEL/////D4MgESAcfnwhBCADIARCIIh8IQMgBEL/////D4MgFSAYfnwhBCADIARCIIh8IQMgBEL/////D4MgGSAUfnwhBCADIARCIIh8IQMgBEL/////D4MgHSAQfnwhBCADIARCIIh8IQMgBEL/////D4MgISAMfnwhBCADIARCIIh8IQMgBEL/////D4NBADUChA4iJSAIfnwhBCADIARCIIh8IQMgBEL/////D4MgBX5C/////w+DISQgBEL/////D4MgCSAkfnwhBCADIARCIIh8IQMgA0IgiCEEIANC/////w+DIAogI358IQMgBCADQiCIfCEEIANC/////w+DIA4gH358IQMgBCADQiCIfCEEIANC/////w+DIBIgG358IQMgBCADQiCIfCEEIANC/////w+DIBYgF358IQMgBCADQiCIfCEEIANC/////w+DIBogE358IQMgBCADQiCIfCEEIANC/////w+DIB4gD358IQMgBCADQiCIfCEEIANC/////w+DICIgC358IQMgBCADQiCIfCEEIANC/////w+DIA0gJH58IQMgBCADQiCIfCEEIANC/////w+DIBEgIH58IQMgBCADQiCIfCEEIANC/////w+DIBUgHH58IQMgBCADQiCIfCEEIANC/////w+DIBkgGH58IQMgBCADQiCIfCEEIANC/////w+DIB0gFH58IQMgBCADQiCIfCEEIANC/////w+DICEgEH58IQMgBCADQiCIfCEEIANC/////w+DICUgDH58IQMgBCADQiCIfCEEIAIgAz4CACAEQiCIIQMgBEL/////D4MgDiAjfnwhBCADIARCIIh8IQMgBEL/////D4MgEiAffnwhBCADIARCIIh8IQMgBEL/////D4MgFiAbfnwhBCADIARCIIh8IQMgBEL/////D4MgGiAXfnwhBCADIARCIIh8IQMgBEL/////D4MgHiATfnwhBCADIARCIIh8IQMgBEL/////D4MgIiAPfnwhBCADIARCIIh8IQMgBEL/////D4MgESAkfnwhBCADIARCIIh8IQMgBEL/////D4MgFSAgfnwhBCADIARCIIh8IQMgBEL/////D4MgGSAcfnwhBCADIARCIIh8IQMgBEL/////D4MgHSAYfnwhBCADIARCIIh8IQMgBEL/////D4MgISAUfnwhBCADIARCIIh8IQMgBEL/////D4MgJSAQfnwhBCADIARCIIh8IQMgAiAEPgIEIANCIIghBCADQv////8PgyASICN+fCEDIAQgA0IgiHwhBCADQv////8PgyAWIB9+fCEDIAQgA0IgiHwhBCADQv////8PgyAaIBt+fCEDIAQgA0IgiHwhBCADQv////8PgyAeIBd+fCEDIAQgA0IgiHwhBCADQv////8PgyAiIBN+fCEDIAQgA0IgiHwhBCADQv////8PgyAVICR+fCEDIAQgA0IgiHwhBCADQv////8PgyAZICB+fCEDIAQgA0IgiHwhBCADQv////8PgyAdIBx+fCEDIAQgA0IgiHwhBCADQv////8PgyAhIBh+fCEDIAQgA0IgiHwhBCADQv////8PgyAlIBR+fCEDIAQgA0IgiHwhBCACIAM+AgggBEIgiCEDIARC/////w+DIBYgI358IQQgAyAEQiCIfCEDIARC/////w+DIBogH358IQQgAyAEQiCIfCEDIARC/////w+DIB4gG358IQQgAyAEQiCIfCEDIARC/////w+DICIgF358IQQgAyAEQiCIfCEDIARC/////w+DIBkgJH58IQQgAyAEQiCIfCEDIARC/////w+DIB0gIH58IQQgAyAEQiCIfCEDIARC/////w+DICEgHH58IQQgAyAEQiCIfCEDIARC/////w+DICUgGH58IQQgAyAEQiCIfCEDIAIgBD4CDCADQiCIIQQgA0L/////D4MgGiAjfnwhAyAEIANCIIh8IQQgA0L/////D4MgHiAffnwhAyAEIANCIIh8IQQgA0L/////D4MgIiAbfnwhAyAEIANCIIh8IQQgA0L/////D4MgHSAkfnwhAyAEIANCIIh8IQQgA0L/////D4MgISAgfnwhAyAEIANCIIh8IQQgA0L/////D4MgJSAcfnwhAyAEIANCIIh8IQQgAiADPgIQIARCIIghAyAEQv////8PgyAeICN+fCEEIAMgBEIgiHwhAyAEQv////8PgyAiIB9+fCEEIAMgBEIgiHwhAyAEQv////8PgyAhICR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAlICB+fCEEIAMgBEIgiHwhAyACIAQ+AhQgA0IgiCEEIANC/////w+DICIgI358IQMgBCADQiCIfCEEIANC/////w+DICUgJH58IQMgBCADQiCIfCEEIAIgAz4CGCAEQiCIIQMgAiAEPgIcIAOnBEAgAkHoDSACEAcaBSACQegNEAUEQCACQegNIAIQBxoLCwsSACAAIAFB6BIQCUHoEiACEBsLCwAgAEGIDiABEBwLFQAgAEGoExAAQcgTEAFBqBMgARAbCxcAIAAgARAfIAFB6A0gARANIAEgARAeCwkAQagOIAAQAAsVACAAIAFB6BMQHEHoE0GIDiACEBwLCwAgAEHoDSABEA0LCgAgAEHAAGoQAgsVACAAEAEgAEEgahAXIABBwABqEAELIgAgACABEAAgAEEgaiABQSBqEAAgAEHAAGogAUHAAGoQAAuGAgAgABAkBEAgACABECYPCyAAIABBiBQQEiAAQSBqIABBIGpBqBQQEkGoFEGoFEHIFBASIABBqBRB6BQQDkHoFEHoFEHoFBASQegUQYgUQegUEA9B6BRByBRB6BQQD0HoFEHoFEHoFBAOQYgUQYgUQYgVEA5BiBVBiBRBiBUQDkGIFUGIFUGoFRASIABBIGogAEHAAGpByBUQEkHoFEHoFCABEA5BqBUgASABEA9ByBRByBRB6BUQDkHoFUHoFUHoFRAOQegVQegVQegVEA5B6BQgASABQSBqEA8gAUEgakGIFSABQSBqEBIgAUEgakHoFSABQSBqEA9ByBVByBUgAUHAAGoQDgusAwIBfwF/IABBwABqIQMgAUHAAGohBCAAECQEQCABIAIQJg8LIAEQJARAIAAgAhAmDwsgAyADQYgWEBIgBCAEQagWEBIgAEGoFkHIFhASIAFBiBZB6BYQEiADQYgWQYgXEBIgBEGoFkGoFxASIABBIGpBqBdByBcQEiABQSBqQYgXQegXEBJByBZB6BYQBARAQcgXQegXEAQEQCAAIAIQJw8LC0HoFkHIFkGIGBAPQegXQcgXQagYEA9BiBhBiBhByBgQDkHIGEHIGEHIGBASQYgYQcgYQegYEBJBqBhBqBhBiBkQDkHIFkHIGEHIGRASQYgZQYgZQagZEBJByBlByBlB6BkQDkGoGUHoGCACEA8gAkHoGSACEA9ByBdB6BhBiBoQEkGIGkGIGkGIGhAOQcgZIAIgAkEgahAPIAJBIGpBiBkgAkEgahASIAJBIGpBiBogAkEgahAPIAMgBCACQcAAahAOIAJBwABqIAJBwABqIAJBwABqEBIgAkHAAGpBiBYgAkHAAGoQDyACQcAAakGoFiACQcAAahAPIAJBwABqQYgYIAJBwABqEBILIgAgACABEAAgAEEgaiABQSBqEBAgAEHAAGogAUHAAGoQAAsQACABIAIQKSAAIAIgAhAoCyIAIAAgARAVIABBIGogAUEgahAVIABBwABqIAFBwABqEBULIgAgACABEBQgAEEgaiABQSBqEBQgAEHAAGogAUHAAGoQFAtPACAAECQEQCABECUFIABBwABqQagaEBZBqBpBqBpByBoQEkGoGkHIGkHoGhASIABByBogARASIABBIGpB6BogAUEgahASIAFBwABqEBcLC6cCAgF/AX8gAEGIGxAmIAMQJSACIQQCQANAIARBAWshBCABIARqLQAAIQUgAyADECcgBUGAAU8EQCAFQYABayEFQYgbIAMgAxAoCyADIAMQJyAFQcAATwRAIAVBwABrIQVBiBsgAyADECgLIAMgAxAnIAVBIE8EQCAFQSBrIQVBiBsgAyADECgLIAMgAxAnIAVBEE8EQCAFQRBrIQVBiBsgAyADECgLIAMgAxAnIAVBCE8EQCAFQQhrIQVBiBsgAyADECgLIAMgAxAnIAVBBE8EQCAFQQRrIQVBiBsgAyADECgLIAMgAxAnIAVBAk8EQCAFQQJrIQVBiBsgAyADECgLIAMgAxAnIAVBAU8EQCAFQQFrIQVBiBsgAyADECgLIARFDQEMAAsLCysCAX8BfyAAQQV2QQJ0IQFBASAAQR9xdCECIAEgASgC6NsBIAJyNgLo2wELJAIBfwF/IABBBXZBAnQhAUEBIABBH3F0IQIgASgC6NsBIAJxC6ABBAF/AX8BfwF/IAAhAkHoGxAlQQAhBAJAA0AgBCABRg0BQegbQQEgBHRB4ABsaiEDIAIQAiEFIAIgAxAAIAJBIGohAiADQSBqIQMgAiADEAAgAkEgaiECIANBIGohAyAFBEAgAxABBSADEBcLIARBAWohBAwACwtB6NsBQpeChIAQNwMAQfDbAUIBNwMAQfjbAUIBNwMAQYDcAUIANwMAC0ADAX8BfwF/QegbIABB4ABsaiEBIAAQMEUEQCAALQCI3AEQMiECIAAtAIjeARAyIQMgAiADIAEQKCAAEC8LIAELpQEEAX8BfwF+AX5BACEDAkADQCADQSBGDQFCACEGQQAhBAJAA0AgBCABRg0BIAAgBEEgbCADamoxAAAhBSAFIAVCHIaEQo+AgIDwAYMhBSAFIAVCDoaEQoOAjICwgMABgyEFIAUgBUIHhoRCgYKEiJCgwIABgyEFIAYgBSAErYaEIQYgBEEBaiEEDAALCyACIANBCGxqIAY3AwAgA0EBaiEDDAALCwtLAQF/IAAgAkGI4AEQMyADECUgASACEDFBACEEAkADQCAEQYACRg0BIAMgAxAnIANBh+IBIARrLQAAEDIgAxAoIARBAWohBAwACwsLfgQBfwF/AX8BfyAAIQUgASEGIAUgAiADbiADbEEgbGohCAJAA0AgBSAIRg0BIAUgBiADQYjiARA0QYjiASAEIAQQKCAFQSAgA2xqIQUgBkHAACADbGohBgwACwsgAiADcCEHIAcEQCAFIAYgB0GI4gEQNEGI4gEgBCAEECgLC04CAX8BfyAAIAJB6OIBEDMgASACEDFBACEEAkADQCAEQYACRg0BIAMgBEHgAGxqIQUgBUHn5AEgBGstAAAQMiAFECggBEEBaiEEDAALCwspAQF/QQAhAgJAA0AgAiABRg0BIAAgAkHgAGxqECUgAkEBaiECDAALCwtIAgF/AX8gACEEIAQgAhAmIARB4ABqIQRBASEDAkADQCADIAFGDQEgAiACECcgBCACIAIQKCAEQeAAaiEEIANBAWohAwwACwsLigEEAX8BfwF/AX9B6OQBQYACEDcgACEFIAEhBiAFIAIgA24gA2xBIGxqIQgCQANAIAUgCEYNASAFIAYgA0Ho5AEQNiAFQSAgA2xqIQUgBkHAACADbGohBgwACwsgAiADcCEHIAcEQCAFIAYgB0Ho5AEQNgtB6OQBQYACQeikAxA4QeikAyAEIAQQKAtGACAAQf8BcS0AiLQDQRh0IABBCHZB/wFxLQCItANBEHRqIABBEHZB/wFxLQCItANBCHQgAEEYdkH/AXEtAIi0A2pqIAF3C2cFAX8BfwF/AX8Bf0EBIAF0IQJBACEDAkADQCADIAJGDQEgACADQSBsaiEFIAMgARA6IQQgACAEQSBsaiEGIAMgBEkEQCAFQYi2AxAAIAYgBRAAQYi2AyAGEAALIANBAWohAwwACwsL7wEJAX8BfwF/AX8BfwF/AX8BfwF/IAAgARA7QQEgAXQhCEEBIQMCQANAIAMgAUsNAUEBIAN0IQZByKUDIANBIGxqIQlBACEEAkADQCAEIAhPDQEgAgRAIAlBIGpBqLYDEAAFQai2AxAhCyAGQQF2IQdBACEFAkADQCAFIAdPDQEgACAEIAVqQSBsaiEKIAogB0EgbGohC0GotgMgC0HItgMQHCAKQei2AxAAQei2A0HItgMgChAYQei2A0HItgMgCxAZQai2AyAJQai2AxAcIAVBAWohBQwACwsgBCAGaiEEDAALCyADQQFqIQMMAAsLCz4DAX8BfwF/IAAhAyABIQQgACACQSBsaiEFAkADQCADIAVGDQEgAyAEEAAgA0EgaiEDIARBwABqIQQMAAsLCz0DAX8BfwF/IAAhAyABIQQgACACQSBsaiEFAkADQCADIAVGDQEgAyAEEB8gA0EgaiEDIARBIGohBAwACwsLPQMBfwF/AX8gACEDIAEhBCAAIAJBIGxqIQUCQANAIAMgBUYNASADIAQQHiADQSBqIQMgBEEgaiEEDAALCwuWAQcBfwF/AX8BfwF/AX8Bf0EBIAF0IQJB6KwDIAFBIGxqIQQgAkEBayEGQQEhBSACQQF2IQMCQANAIAUgA0YNASAAIAVBIGxqIQcgACACIAVrQSBsaiEIIAdBiLcDEAAgCCAEIAcQHEGItwMgBCAIEBwgBUEBaiEFDAALCyAAIAQgABAcIAAgA0EgbGohCCAIIAQgCBAcC0MCAX8BfyAAQQF2IQJBACEBAkADQCACRQ0BIAJBAXYhAiABQQFqIQEMAAsLIABBASABdEcEQAALIAFBHEsEQAALIAELEgEBfyABEEEhAyAAIAMgAhA8CxgBAX8gARBBIQMgACADIAIQPCAAIAMQQAtMBAF/AX8BfwF/IAAhBCABIQUgAyEGIAAgAkEgbGohBwJAA0AgBCAHRg0BIAQgBSAGEBwgBEEgaiEEIAVBIGohBSAGQSBqIQYMAAsLCy4CAX8BfyAAIQMgACABQSBsaiECAkADQCADIAJGDQEgAxABIANBIGohAwwACwsLjgEGAX8BfwF/AX8BfwF/QQAhBCAAIQYgASEHAkADQCAEIAJGDQEgBigCACEJIAZBBGohBkEAIQUCQANAIAUgCUYNASADIAYoAgBBIGxqIQggBkEEaiEGIAcgBkGotwMQHEGotwMgCCAIEBggBkEgaiEGIAVBAWohBQwACwsgB0EgaiEHIARBAWohBAwACwsLDgAgABACIABBIGoQAnELDQAgABABIABBIGoQAQsNACAAEBcgAEEgahABCxQAIAAgARAAIABBIGogAUEgahAAC3kAIAAgAUHotwMQEiAAQSBqIAFBIGpBiLgDEBIgACAAQSBqQai4AxAOIAEgAUEgakHIuAMQDkGouANByLgDQai4AxASQYi4A0HItwMgAhASQei3AyACIAIQDkHotwNBiLgDIAJBIGoQDkGouAMgAkEgaiACQSBqEA8LGwAgACABIAIQDiAAQSBqIAFBIGogAkEgahAOCxsAIAAgASACEA8gAEEgaiABQSBqIAJBIGoQDwsUACAAIAEQECAAQSBqIAFBIGoQEAsUACAAIAEQFCAAQSBqIAFBIGoQFAsUACAAIAEQFSAAQSBqIAFBIGoQFQsVACAAIAEQBCAAQSBqIAFBIGoQBHELaAAgACAAQei4AxASIABBIGogAEEgakGIuQMQEkGIuQNByLcDQai5AxASQei4A0GouQNBqLkDEA9BqLkDQci5AxAWIABByLkDIAEQEiAAQSBqQci5AyABQSBqEBIgAUEgaiABQSBqEBALCgAgAEGAAWoQRwsWACAAEEggAEHAAGoQSSAAQYABahBICyQAIAAgARBKIABBwABqIAFBwABqEEogAEGAAWogAUGAAWoQSgu8AgAgABBTBEAgACABEFUPCyAAIABB6LkDEEsgAEHAAGogAEHAAGpBqLoDEEtBqLoDQai6A0HougMQSyAAQai6A0GouwMQTEGouwNBqLsDQai7AxBLQai7A0HouQNBqLsDEE1BqLsDQei6A0GouwMQTUGouwNBqLsDQai7AxBMQei5A0HouQNB6LsDEExB6LsDQei5A0HouwMQTEHouwNB6LsDQai8AxBLIABBwABqIABBgAFqQei8AxBLQai7A0GouwMgARBMQai8AyABIAEQTUHougNB6LoDQai9AxBMQai9A0GovQNBqL0DEExBqL0DQai9A0GovQMQTEGouwMgASABQcAAahBNIAFBwABqQei7AyABQcAAahBLIAFBwABqQai9AyABQcAAahBNQei8A0HovAMgAUGAAWoQTAvvAwIBfwF/IABBgAFqIQMgAUGAAWohBCAAEFMEQCABIAIQVQ8LIAEQUwRAIAAgAhBVDwsgAyADQei9AxBLIAQgBEGovgMQSyAAQai+A0HovgMQSyABQei9A0GovwMQSyADQei9A0HovwMQSyAEQai+A0GowAMQSyAAQcAAakGowANB6MADEEsgAUHAAGpB6L8DQajBAxBLQei+A0GovwMQUQRAQejAA0GowQMQUQRAIAAgAhBWDwsLQai/A0HovgNB6MEDEE1BqMEDQejAA0GowgMQTUHowQNB6MEDQejCAxBMQejCA0HowgNB6MIDEEtB6MEDQejCA0GowwMQS0GowgNBqMIDQejDAxBMQei+A0HowgNB6MQDEEtB6MMDQejDA0GoxAMQS0HoxANB6MQDQajFAxBMQajEA0GowwMgAhBNIAJBqMUDIAIQTUHowANBqMMDQejFAxBLQejFA0HoxQNB6MUDEExB6MQDIAIgAkHAAGoQTSACQcAAakHowwMgAkHAAGoQSyACQcAAakHoxQMgAkHAAGoQTSADIAQgAkGAAWoQTCACQYABaiACQYABaiACQYABahBLIAJBgAFqQei9AyACQYABahBNIAJBgAFqQai+AyACQYABahBNIAJBgAFqQejBAyACQYABahBLCyQAIAAgARBKIABBwABqIAFBwABqEE4gAEGAAWogAUGAAWoQSgsQACABIAIQWCAAIAIgAhBXCyQAIAAgARBQIABBwABqIAFBwABqEFAgAEGAAWogAUGAAWoQUAskACAAIAEQTyAAQcAAaiABQcAAahBPIABBgAFqIAFBgAFqEE8LWgAgABBTBEAgARBUBSAAQYABakGoxgMQUkGoxgNBqMYDQejGAxBLQajGA0HoxgNBqMcDEEsgAEHoxgMgARBLIABBwABqQajHAyABQcAAahBLIAFBgAFqEEkLC7ACAgF/AX8gAEHo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"), (v) => v.charCodeAt(0));
    exports2.pq = 1e3;
    exports2.pr = 1768;
  }
});

// (disabled):worker_threads
var require_worker_threads = __commonJS({
  "(disabled):worker_threads"() {
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// src/groth16.js
var require_groth16 = __commonJS({
  "src/groth16.js"(exports2, module2) {
    var bigInt2 = require_BigInteger();
    var groth16_wasm = require_groth16_wasm();
    var inBrowser = typeof window !== "undefined";
    var NodeWorker;
    var NodeCrypto;
    if (!inBrowser) {
      NodeWorker = require_worker_threads().Worker;
      NodeCrypto = require_crypto();
    }
    var Deferred = class {
      constructor() {
        this.promise = new Promise((resolve, reject) => {
          this.reject = reject;
          this.resolve = resolve;
        });
      }
    };
    function thread(self) {
      let instance;
      let memory;
      let i32;
      async function init(data) {
        const code = new Uint8Array(data.code);
        const wasmModule = await WebAssembly.compile(code);
        memory = new WebAssembly.Memory({ initial: data.init });
        i32 = new Uint32Array(memory.buffer);
        instance = await WebAssembly.instantiate(wasmModule, {
          env: {
            "memory": memory
          }
        });
      }
      function alloc(length) {
        while (i32[0] & 3) i32[0]++;
        const res = i32[0];
        i32[0] += length;
        while (i32[0] > memory.buffer.byteLength) {
          memory.grow(100);
        }
        i32 = new Uint32Array(memory.buffer);
        return res;
      }
      function putBin(b) {
        const p = alloc(b.byteLength);
        const s32 = new Uint32Array(b);
        i32.set(s32, p / 4);
        return p;
      }
      function getBin(p, l) {
        return memory.buffer.slice(p, p + l);
      }
      self.onmessage = function(e) {
        let data;
        if (e.data) {
          data = e.data;
        } else {
          data = e;
        }
        if (data.command == "INIT") {
          init(data).then(function() {
            self.postMessage(data.result);
          });
        } else if (data.command == "G1_MULTIEXP") {
          const oldAlloc = i32[0];
          const pScalars = putBin(data.scalars);
          const pPoints = putBin(data.points);
          const pRes = alloc(96);
          instance.exports.g1_zero(pRes);
          instance.exports.g1_multiexp2(pScalars, pPoints, data.n, 7, pRes);
          data.result = getBin(pRes, 96);
          i32[0] = oldAlloc;
          self.postMessage(data.result, [data.result]);
        } else if (data.command == "G2_MULTIEXP") {
          const oldAlloc = i32[0];
          const pScalars = putBin(data.scalars);
          const pPoints = putBin(data.points);
          const pRes = alloc(192);
          instance.exports.g2_zero(pRes);
          instance.exports.g2_multiexp(pScalars, pPoints, data.n, 7, pRes);
          data.result = getBin(pRes, 192);
          i32[0] = oldAlloc;
          self.postMessage(data.result, [data.result]);
        } else if (data.command == "CALC_H") {
          const oldAlloc = i32[0];
          const pSignals = putBin(data.signals);
          const pPolsA = putBin(data.polsA);
          const pPolsB = putBin(data.polsB);
          const nSignals = data.nSignals;
          const domainSize = data.domainSize;
          const pSignalsM = alloc(nSignals * 32);
          const pPolA = alloc(domainSize * 32);
          const pPolB = alloc(domainSize * 32);
          const pPolA2 = alloc(domainSize * 32 * 2);
          const pPolB2 = alloc(domainSize * 32 * 2);
          instance.exports.fft_toMontgomeryN(pSignals, pSignalsM, nSignals);
          instance.exports.pol_zero(pPolA, domainSize);
          instance.exports.pol_zero(pPolB, domainSize);
          instance.exports.pol_constructLC(pPolsA, pSignalsM, nSignals, pPolA);
          instance.exports.pol_constructLC(pPolsB, pSignalsM, nSignals, pPolB);
          instance.exports.fft_copyNInterleaved(pPolA, pPolA2, domainSize);
          instance.exports.fft_copyNInterleaved(pPolB, pPolB2, domainSize);
          instance.exports.fft_ifft(pPolA, domainSize, 0);
          instance.exports.fft_ifft(pPolB, domainSize, 0);
          instance.exports.fft_fft(pPolA, domainSize, 1);
          instance.exports.fft_fft(pPolB, domainSize, 1);
          instance.exports.fft_copyNInterleaved(pPolA, pPolA2 + 32, domainSize);
          instance.exports.fft_copyNInterleaved(pPolB, pPolB2 + 32, domainSize);
          instance.exports.fft_mulN(pPolA2, pPolB2, domainSize * 2, pPolA2);
          instance.exports.fft_ifft(pPolA2, domainSize * 2, 0);
          instance.exports.fft_fromMontgomeryN(pPolA2 + domainSize * 32, pPolA2 + domainSize * 32, domainSize);
          data.result = getBin(pPolA2 + domainSize * 32, domainSize * 32);
          i32[0] = oldAlloc;
          self.postMessage(data.result, [data.result]);
        } else if (data.command == "TERMINATE") {
          process.exit();
        }
      };
    }
    async function build(params) {
      const defaultParams = { wasmInitialMemory: 5e3 };
      Object.assign(defaultParams, params);
      const groth16 = new Groth16();
      groth16.q = bigInt2("21888242871839275222246405745257275088696311157297823662689037894645226208583");
      groth16.r = bigInt2("21888242871839275222246405745257275088548364400416034343698204186575808495617");
      groth16.n64 = Math.floor((groth16.q.minus(1).bitLength() - 1) / 64) + 1;
      groth16.n32 = groth16.n64 * 2;
      groth16.n8 = groth16.n64 * 8;
      groth16.memory = new WebAssembly.Memory({ initial: defaultParams.wasmInitialMemory });
      groth16.i32 = new Uint32Array(groth16.memory.buffer);
      const wasmModule = await WebAssembly.compile(groth16_wasm.code);
      groth16.instance = await WebAssembly.instantiate(wasmModule, {
        env: {
          "memory": groth16.memory
        }
      });
      groth16.pq = groth16_wasm.pq;
      groth16.pr = groth16_wasm.pr;
      groth16.pr0 = groth16.alloc(192);
      groth16.pr1 = groth16.alloc(192);
      groth16.workers = [];
      groth16.pendingDeferreds = [];
      groth16.working = [];
      let concurrency;
      if (typeof navigator === "object" && navigator.hardwareConcurrency) {
        concurrency = navigator.hardwareConcurrency;
      } else {
        concurrency = 8;
      }
      function getOnMsg(i) {
        return function(e) {
          let data;
          if (e && e.data) {
            data = e.data;
          } else {
            data = e;
          }
          groth16.working[i] = false;
          groth16.pendingDeferreds[i].resolve(data);
          groth16.processWorks();
        };
      }
      for (let i = 0; i < concurrency; i++) {
        if (inBrowser) {
          const blob = new Blob(["(", thread.toString(), ")(self);"], { type: "text/javascript" });
          const url = URL.createObjectURL(blob);
          groth16.workers[i] = new Worker(url);
          groth16.workers[i].onmessage = getOnMsg(i);
        } else {
          groth16.workers[i] = new NodeWorker("(" + thread.toString() + ")(require('worker_threads').parentPort);", { eval: true });
          groth16.workers[i].on("message", getOnMsg(i));
        }
        groth16.working[i] = false;
      }
      const initPromises = [];
      for (let i = 0; i < groth16.workers.length; i++) {
        const copyCode = groth16_wasm.code.buffer.slice(0);
        initPromises.push(groth16.postAction(i, {
          command: "INIT",
          init: defaultParams.wasmInitialMemory,
          code: copyCode
        }, [copyCode]));
      }
      await Promise.all(initPromises);
      return groth16;
    }
    var Groth16 = class {
      constructor() {
        this.actionQueue = [];
      }
      postAction(workerId, e, transfers, _deferred) {
        if (!(this.working[workerId] == false)) throw new Error(`Expected 'this.working[workerId] == false' but this.working[workerId] was ${this.working[workerId]}`);
        this.working[workerId] = true;
        this.pendingDeferreds[workerId] = _deferred ? _deferred : new Deferred();
        this.workers[workerId].postMessage(e, transfers);
        return this.pendingDeferreds[workerId].promise;
      }
      processWorks() {
        for (let i = 0; i < this.workers.length && this.actionQueue.length > 0; i++) {
          if (this.working[i] == false) {
            const work = this.actionQueue.shift();
            this.postAction(i, work.data, work.transfers, work.deferred);
          }
        }
      }
      queueAction(actionData, transfers) {
        const d = new Deferred();
        this.actionQueue.push({
          data: actionData,
          transfers,
          deferred: d
        });
        this.processWorks();
        return d.promise;
      }
      alloc(length) {
        while (this.i32[0] & 3) this.i32[0]++;
        const res = this.i32[0];
        this.i32[0] += length;
        return res;
      }
      putBin(p, b) {
        const s32 = new Uint32Array(b);
        this.i32.set(s32, p / 4);
      }
      getBin(p, l) {
        return this.memory.buffer.slice(p, p + l);
      }
      bin2int(b) {
        const i32 = new Uint32Array(b);
        let acc = bigInt2(i32[7]);
        for (let i = 6; i >= 0; i--) {
          acc = acc.shiftLeft(32);
          acc = acc.add(i32[i]);
        }
        return acc.toString();
      }
      bin2g1(b) {
        return [
          this.bin2int(b.slice(0, 32)),
          this.bin2int(b.slice(32, 64)),
          this.bin2int(b.slice(64, 96))
        ];
      }
      bin2g2(b) {
        return [
          [
            this.bin2int(b.slice(0, 32)),
            this.bin2int(b.slice(32, 64))
          ],
          [
            this.bin2int(b.slice(64, 96)),
            this.bin2int(b.slice(96, 128))
          ],
          [
            this.bin2int(b.slice(128, 160)),
            this.bin2int(b.slice(160, 192))
          ]
        ];
      }
      async g1_multiexp(scalars, points) {
        const nPoints = scalars.byteLength / 32;
        const nPointsPerThread = Math.floor(nPoints / this.workers.length);
        const opPromises = [];
        for (let i = 0; i < this.workers.length; i++) {
          const th_nPoints = i < this.workers.length - 1 ? nPointsPerThread : nPoints - nPointsPerThread * (this.workers.length - 1);
          const scalars_th = scalars.slice(i * nPointsPerThread * 32, i * nPointsPerThread * 32 + th_nPoints * 32);
          const points_th = points.slice(i * nPointsPerThread * 64, i * nPointsPerThread * 64 + th_nPoints * 64);
          opPromises.push(
            this.queueAction({
              command: "G1_MULTIEXP",
              scalars: scalars_th,
              points: points_th,
              n: th_nPoints
            }, [scalars_th, points_th])
          );
        }
        const results = await Promise.all(opPromises);
        this.instance.exports.g1_zero(this.pr0);
        for (let i = 0; i < results.length; i++) {
          this.putBin(this.pr1, results[i]);
          this.instance.exports.g1_add(this.pr0, this.pr1, this.pr0);
        }
        return this.getBin(this.pr0, 96);
      }
      async g2_multiexp(scalars, points) {
        const nPoints = scalars.byteLength / 32;
        const nPointsPerThread = Math.floor(nPoints / this.workers.length);
        const opPromises = [];
        for (let i = 0; i < this.workers.length; i++) {
          const th_nPoints = i < this.workers.length - 1 ? nPointsPerThread : nPoints - nPointsPerThread * (this.workers.length - 1);
          const scalars_th = scalars.slice(i * nPointsPerThread * 32, i * nPointsPerThread * 32 + th_nPoints * 32);
          const points_th = points.slice(i * nPointsPerThread * 128, i * nPointsPerThread * 128 + th_nPoints * 128);
          opPromises.push(
            this.queueAction({
              command: "G2_MULTIEXP",
              scalars: scalars_th,
              points: points_th,
              n: th_nPoints
            }, [scalars_th, points_th])
          );
        }
        const results = await Promise.all(opPromises);
        this.instance.exports.g2_zero(this.pr0);
        for (let i = 0; i < results.length; i++) {
          this.putBin(this.pr1, results[i]);
          this.instance.exports.g2_add(this.pr0, this.pr1, this.pr0);
        }
        return this.getBin(this.pr0, 192);
      }
      g1_affine(p) {
        this.putBin(this.pr0, p);
        this.instance.exports.g1_affine(this.pr0, this.pr0);
        return this.getBin(this.pr0, 96);
      }
      g2_affine(p) {
        this.putBin(this.pr0, p);
        this.instance.exports.g2_affine(this.pr0, this.pr0);
        return this.getBin(this.pr0, 192);
      }
      g1_fromMontgomery(p) {
        this.putBin(this.pr0, p);
        this.instance.exports.g1_fromMontgomery(this.pr0, this.pr0);
        return this.getBin(this.pr0, 96);
      }
      g2_fromMontgomery(p) {
        this.putBin(this.pr0, p);
        this.instance.exports.g2_fromMontgomery(this.pr0, this.pr0);
        return this.getBin(this.pr0, 192);
      }
      loadPoint1(b) {
        const p = this.alloc(96);
        this.putBin(p, b);
        this.instance.exports.f1m_one(p + 64);
        return p;
      }
      loadPoint2(b) {
        const p = this.alloc(192);
        this.putBin(p, b);
        this.instance.exports.f2m_one(p + 128);
        return p;
      }
      terminate() {
        for (let i = 0; i < this.workers.length; i++) {
          this.workers[i].postMessage({ command: "TERMINATE" });
        }
      }
      async calcH(signals, polsA, polsB, nSignals, domainSize) {
        return this.queueAction({
          command: "CALC_H",
          signals,
          polsA,
          polsB,
          nSignals,
          domainSize
        }, [signals, polsA, polsB]);
      }
      async proof(signals, pkey) {
        const pkey32 = new Uint32Array(pkey);
        const nSignals = pkey32[0];
        const nPublic = pkey32[1];
        const domainSize = pkey32[2];
        const pPolsA = pkey32[3];
        const pPolsB = pkey32[4];
        const pPointsA = pkey32[5];
        const pPointsB1 = pkey32[6];
        const pPointsB2 = pkey32[7];
        const pPointsC = pkey32[8];
        const pHExps = pkey32[9];
        const polsA = pkey.slice(pPolsA, pPolsA + pPolsB);
        const polsB = pkey.slice(pPolsB, pPolsB + pPointsA);
        const pointsA = pkey.slice(pPointsA, pPointsA + nSignals * 64);
        const pointsB1 = pkey.slice(pPointsB1, pPointsB1 + nSignals * 64);
        const pointsB2 = pkey.slice(pPointsB2, pPointsB2 + nSignals * 128);
        const pointsC = pkey.slice(pPointsC, pPointsC + (nSignals - nPublic - 1) * 64);
        const pointsHExps = pkey.slice(pHExps, pHExps + domainSize * 64);
        const alfa1 = pkey.slice(10 * 4, 10 * 4 + 64);
        const beta1 = pkey.slice(10 * 4 + 64, 10 * 4 + 128);
        const delta1 = pkey.slice(10 * 4 + 128, 10 * 4 + 192);
        const beta2 = pkey.slice(10 * 4 + 192, 10 * 4 + 320);
        const delta2 = pkey.slice(10 * 4 + 320, 10 * 4 + 448);
        const pH = this.calcH(signals.slice(0), polsA, polsB, nSignals, domainSize).then((h) => {
          return this.g1_multiexp(h, pointsHExps);
        });
        const pA = this.g1_multiexp(signals.slice(0), pointsA);
        const pB1 = this.g1_multiexp(signals.slice(0), pointsB1);
        const pB2 = this.g2_multiexp(signals.slice(0), pointsB2);
        const pC = this.g1_multiexp(signals.slice((nPublic + 1) * 32), pointsC);
        const res = await Promise.all([pA, pB1, pB2, pC, pH]);
        const pi_a = this.alloc(96);
        const pi_b = this.alloc(192);
        const pi_c = this.alloc(96);
        const pib1 = this.alloc(96);
        this.putBin(pi_a, res[0]);
        this.putBin(pib1, res[1]);
        this.putBin(pi_b, res[2]);
        this.putBin(pi_c, res[3]);
        const pAlfa1 = this.loadPoint1(alfa1);
        const pBeta1 = this.loadPoint1(beta1);
        const pDelta1 = this.loadPoint1(delta1);
        const pBeta2 = this.loadPoint2(beta2);
        const pDelta2 = this.loadPoint2(delta2);
        let rnd = new Uint32Array(8);
        const aux1 = this.alloc(96);
        const aux2 = this.alloc(192);
        const pr = this.alloc(32);
        const ps = this.alloc(32);
        if (inBrowser) {
          window.crypto.getRandomValues(rnd);
          this.putBin(pr, rnd);
          window.crypto.getRandomValues(rnd);
          this.putBin(ps, rnd);
        } else {
          const br = NodeCrypto.randomBytes(32);
          this.putBin(pr, br);
          const bs = NodeCrypto.randomBytes(32);
          this.putBin(ps, bs);
        }
        this.instance.exports.g1_add(pAlfa1, pi_a, pi_a);
        this.instance.exports.g1_timesScalar(pDelta1, pr, 32, aux1);
        this.instance.exports.g1_add(aux1, pi_a, pi_a);
        this.instance.exports.g2_add(pBeta2, pi_b, pi_b);
        this.instance.exports.g2_timesScalar(pDelta2, ps, 32, aux2);
        this.instance.exports.g2_add(aux2, pi_b, pi_b);
        this.instance.exports.g1_add(pBeta1, pib1, pib1);
        this.instance.exports.g1_timesScalar(pDelta1, ps, 32, aux1);
        this.instance.exports.g1_add(aux1, pib1, pib1);
        this.putBin(aux1, res[4]);
        this.instance.exports.g1_add(aux1, pi_c, pi_c);
        this.instance.exports.g1_timesScalar(pi_a, ps, 32, aux1);
        this.instance.exports.g1_add(aux1, pi_c, pi_c);
        this.instance.exports.g1_timesScalar(pib1, pr, 32, aux1);
        this.instance.exports.g1_add(aux1, pi_c, pi_c);
        const prs = this.alloc(64);
        this.instance.exports.int_mul(pr, ps, prs);
        this.instance.exports.g1_timesScalar(pDelta1, prs, 64, aux1);
        this.instance.exports.g1_neg(aux1, aux1);
        this.instance.exports.g1_add(aux1, pi_c, pi_c);
        this.instance.exports.g1_affine(pi_a, pi_a);
        this.instance.exports.g2_affine(pi_b, pi_b);
        this.instance.exports.g1_affine(pi_c, pi_c);
        this.instance.exports.g1_fromMontgomery(pi_a, pi_a);
        this.instance.exports.g2_fromMontgomery(pi_b, pi_b);
        this.instance.exports.g1_fromMontgomery(pi_c, pi_c);
        return {
          pi_a: this.bin2g1(this.getBin(pi_a, 96)),
          pi_b: this.bin2g2(this.getBin(pi_b, 192)),
          pi_c: this.bin2g1(this.getBin(pi_c, 96))
        };
      }
    };
    module2.exports = build;
  }
});

// index.js
var require_index = __commonJS({
  "index.js"(exports2, module2) {
    module2.exports.buildF1 = require_f1();
    module2.exports.buildBn128 = require_bn128();
    module2.exports.buildGroth16 = require_groth16();
  }
});
export default require_index();
