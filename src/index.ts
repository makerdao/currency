import { Currency as Currency_, CurrencyRatio } from './Currency';
export const Currency = Currency_;



export function createCurrency(symbol) {
  interface CreatorFN {
    wei?: (amount: any) => any,
    ray?: (amount: any) => any,
    rad?: (amount: any) => any,
    isInstance?: (obj: any) => boolean,
    (amount: any, shift?: any): CurrencyX
  }
  // This provides short syntax, e.g. ETH(6). We need a wrapper function because
  // you can't call an ES6 class consructor without `new`
  const creatorFn: CreatorFN = (amount, shift?) => new CurrencyX(amount, shift);

  class CurrencyX extends Currency {
    constructor(amount, shift) {
      super(amount, shift, symbol);
    }
  }

  // this changes the name of the class in stack traces
  Object.defineProperty(CurrencyX, 'name', { value: symbol });
  Object.defineProperty(CurrencyX, 'symbol', { value: symbol });

  Object.assign(creatorFn, {
    wei: makeShiftedCreatorFn(creatorFn, symbol, 'wei'),
    ray: makeShiftedCreatorFn(creatorFn, symbol, 'ray'),
    rad: makeShiftedCreatorFn(creatorFn, symbol, 'rad'),
    symbol,
    isInstance: obj => obj instanceof CurrencyX
  });

  Object.assign(CurrencyX, { wei: creatorFn.wei , ray: creatorFn.ray });
  return creatorFn;
}

export function createCurrencyRatio(wrappedNumerator, wrappedDenominator) {
  interface CreatorFN {
    wei?: (amount: any) => any,
    ray?: (amount: any) => any,
    rad?: (amount: any) => any,
    isInstance?: (obj: any) => boolean,
    (amount: any, shift?: any): CurrencyRatio
  }

  const numerator = wrappedNumerator(0).constructor;
  const denominator = wrappedDenominator(0).constructor;

  const creatorFn: CreatorFN = (amount, shift?) =>
    new CurrencyRatio(amount, numerator, denominator, shift);

  const symbol = `${numerator.symbol}/${denominator.symbol}`;

  Object.assign(creatorFn, {
    wei: makeShiftedCreatorFn(creatorFn, symbol, 'wei'),
    ray: makeShiftedCreatorFn(creatorFn, symbol, 'ray'),
    rad: makeShiftedCreatorFn(creatorFn, symbol, 'rad'),
    symbol,
    isInstance: obj => obj instanceof CurrencyRatio && obj.symbol === symbol
  });

  return creatorFn;
}

function makeShiftedCreatorFn(creatorFn, symbol, shift) {
  const fn = amount => creatorFn(amount, shift);
  // these two properties are used by getCurrency
  fn.symbol = symbol;
  fn.shift = shift;
  return fn;
}

/*
this factory function produces a function that will check input values against a
whitelist; it's useful if you want to accept a variety of inputs, e.g.:

  foo(ETH(1))
  foo(1, ETH)
  foo(1)      // if you set a default unit argument
  foo('1')    // if you set a default unit argument
*/
export const createGetCurrency = currencies => (amount, unit) => {
  if (amount instanceof Currency) return amount;
  if (!unit) throw new Error('Amount is not a Currency');
  const key = typeof unit === 'string' ? unit.toUpperCase() : unit.symbol;
  const ctor = currencies[key];
  if (!ctor) {
    throw new Error(`Couldn't find currency for "${key}"`);
  }
  return ctor(amount, unit.shift);
};
