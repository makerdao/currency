import BigNumber from 'bignumber.js';

function amountToBigNumber(amount) {
  if (amount instanceof Currency || typeof amount.toBigNumber === 'function')
    return amount.toBigNumber();

  const value = new BigNumber(amount);
  if (value.isNaN()) throw new Error(`amount "${amount}" is not a number`);
  return value;
}

export class Currency extends BigNumber {
  _amount;
  symbol;
  numerator;
  denominator;
  shift;
  name;

  constructor(amount, shift: number | string = 0, symbol = '???') {
    
    if (shift === 'wei') shift = -18;
    if (shift === 'ray') shift = -27;
    if (shift === 'rad') shift = -45;
    const _amount = shift
      ? amountToBigNumber(amount).shiftedBy(shift)
      : amountToBigNumber(amount);
    super(_amount);
    this._amount = _amount;
    this.symbol = symbol;
    this.shift = shift;
    this.name = symbol;
  }

  isEqual(other) {
    return this._amount.eq(other._amount) && this.symbol == other.symbol;
  }

  toString(decimals = 2) {
    return `${this._amount.toFixed(decimals)} ${this.symbol}`;
  }

  toBigNumber() {
    return this._amount;
  }

  toNumber() {
    return this._amount.toNumber();
  }

  toFixed(shift: number|string = 0) {
    if (shift === 'wei') shift = 18;
    if (shift === 'ray') shift = 27;
    if (shift === 'rad') shift = 45;

    // always round down so that we never attempt to spend more than we have
    return this._amount
      .shiftedBy(shift)
      .integerValue(BigNumber.ROUND_DOWN)
      .toFixed();
  }

  isSameType(other) {
    return this.symbol === other.symbol;
  }
}

// FIXME: this is not exactly analogous to Currency above, because all the
// different pairs are instances of the same class rather than subclasses in
// their own right. but for now it works fine, because it's the wrapper
// functions that are used externally anyway. so if we want to be consistent, we
// could either create subclasses for each ratio, or refactor Currency so it
// also just stores its symbol in the instance rather than the subclass.
export class CurrencyRatio extends Currency {
  constructor(amount, numerator, denominator, shift?) {
    super(amount, shift);
    this.numerator = numerator;
    this.denominator = denominator;
    this.symbol = `${numerator.symbol}/${denominator.symbol}`;
  }
}

const mathFunctions = [
  ['plus', 'add'],
  ['minus', 'sub'],
  ['times', 'multipliedBy', 'mul'],
  ['div', 'dividedBy'],
  ['shiftedBy']
];

const booleanFunctions = [
  ['isLessThan', 'lt'],
  ['isLessThanOrEqualTo', 'lte'],
  ['isGreaterThan', 'gt'],
  ['isGreaterThanOrEqualTo', 'gte'],
  ['eq']
];

function assertValidOperation(method, left, right) {
  if (!right && right !== 0) {
    throw new Error(
      `Invalid operation: ${left.symbol} ${method} with no right operand`
    );
  }

  if (!(right instanceof Currency) || left.isSameType(right)) return;

  if (right instanceof CurrencyRatio) {
    // only supporting Currency as a left operand for now, though we could
    // extend this to support ratio-ratio math if needed
    switch (method) {
      case 'times':
        if (left.isSameType(right.denominator)) return;
        break;
      case 'div':
        if (left.isSameType(right.numerator)) return;
        break;
    }
  } else {
    switch (method) {
      // division between two different units results in a ratio, e.g. USD/DAI
      case 'div':
        return;
    }
  }

  throw new Error(
    `Invalid operation: ${left.symbol} ${method} ${right.symbol}`
  );
}

function bigNumberFnResult(method, left, right, value) {
  if (right instanceof CurrencyRatio) {
    switch (method) {
      case 'times':
        return new right.numerator(value);
      case 'div':
        return new right.denominator(value);
    }
  }

  if (!(right instanceof Currency) || left.isSameType(right)) {
    if (left instanceof CurrencyRatio) {
      return new CurrencyRatio(
        value,
        left.numerator,
        left.denominator,
        left.shift
      );
    }
    return new left.constructor(value);
  }

  return new CurrencyRatio(value, left.constructor, right.constructor);
}

function bigNumberFnWrapper(method, isBoolean = false) {
  return function (other) {
    assertValidOperation(method, this, other);

    const otherBigNumber =
      other instanceof Currency ? other.toBigNumber() : other;

    const value = this.toBigNumber()[method](otherBigNumber);
    return isBoolean ? value : bigNumberFnResult(method, this, other, value);
  };
}

Object.assign(
  Currency.prototype,
  mathFunctions.reduce((output, [method, ...aliases]) => {
    output[method] = bigNumberFnWrapper(method);
    for (let alias of aliases) {
      output[alias] = output[method];
    }
    return output;
  }, {}),
  booleanFunctions.reduce((output, [method, ...aliases]) => {
    output[method] = bigNumberFnWrapper(method, true);
    for (let alias of aliases) {
      output[alias] = output[method];
    }
    return output;
  }, {})
);
