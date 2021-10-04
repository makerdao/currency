import { Currency, createCurrency, createCurrencyRatio } from '../src';
import BigNumber from 'bignumber.js';

const DAI = createCurrency('DAI');
const MKR = createCurrency('MKR');
const ETH = createCurrency('ETH');
const PETH = createCurrency('PETH');
const WETH = createCurrency('WETH');
const USD = createCurrency('USD');
const USD_DAI = createCurrencyRatio(USD, DAI);

test('short syntax', () => {
  expect(ETH(1).toSymbolString()).toBe('1.00 ETH');
  expect(PETH(2).toSymbolString()).toBe('2.00 PETH');
  expect(WETH(3).toSymbolString()).toBe('3.00 WETH');
  expect(DAI(4).toSymbolString()).toBe('4.00 DAI');
  expect(MKR(5).toSymbolString()).toBe('5.00 MKR');
});

test('optional shift argument', () => {
  expect(ETH(100, -2).toSymbolString()).toBe('1.00 ETH');
});

test('short syntax for wei (1e18) amounts', () => {
  const n = MKR.wei('2110000000000000000');
  expect(n.toNumber()).toEqual(MKR(2.11).toNumber());
});

test('short syntax for ray (1e27) amounts', () => {
  const n = PETH.ray('5130000000000000000000000000');
  expect(n.toNumber()).toEqual(PETH(5.13).toNumber());
});

test('short syntax for rad (1e45) amounts', () => {
  const n = PETH.rad('1470000000000000000000000000000000000000000000');
  expect(n.toNumber()).toEqual(PETH(1.47).toNumber());
});

test('toString prints the specified number of decimals', () => {
  const n = MKR('1000.5447123');
  expect(n.toSymbolString(3)).toBe('1000.545 MKR');
});

test('basic math', () => {
  const a = MKR('1.2');
  const b = MKR('3.4');
  expect(a.plus(b).toSymbolString()).toBe('4.60 MKR');
});

test('comparisons', () => {
  const a = MKR('1.2');
  const b = MKR('3.4');
  expect(a.lt(b)).toBe(true);
  expect(a.gt(b)).toBe(false);
});

test('prevent math on mismatched types', () => {
  expect(() => {
    MKR(1).plus(DAI(1));
  }).toThrow('Invalid operation: MKR plus DAI');

  expect(() => {
    USD(1).times(USD_DAI(2));
  }).toThrow('Invalid operation: USD times USD/DAI');

  expect(() => {
    DAI(4).div(USD_DAI(2));
  }).toThrow('Invalid operation: DAI div USD/DAI');
});

test('equality of different instances', () => {
  expect(MKR('2').isEqual(MKR('2'))).toBeTruthy();
  expect(MKR('2').isEqual(MKR('2.1'))).not.toBeTruthy();
});

test('convert to fixed-point string with optional shifting', () => {
  expect(DAI(500).toFixed()).toEqual('500');
  expect(DAI(500).toFixed(2)).toEqual('50000');
  expect(DAI(5).toFixed('wei')).toEqual('5000000000000000000');
  expect(DAI(5).toFixed('ray')).toEqual('5000000000000000000000000000');
  expect(DAI(5).toFixed('rad')).toEqual(
    '5000000000000000000000000000000000000000000000'
  );

  // always round down amounts smaller than 1 wei
  expect(DAI.wei(1.5).toFixed('wei')).toEqual('1');
});

test('wrap some BigNumber methods', () => {
  expect(DAI(4).shiftedBy(2).toNumber()).toEqual(DAI(400).toNumber());
});

test('toNumber', () => {
  expect(ETH(5).toNumber()).toEqual(5);
});

test('ratios', () => {
  const value = USD_DAI(14);
  expect(value.toSymbolString()).toEqual('14.00 USD/DAI');
});

test('multiplying by a ratio', () => {
  const value1 = DAI(20);
  const value2 = USD_DAI(4);
  expect(value1.times(value2).toNumber()).toEqual(USD(80).toNumber());
});

test('dividing by a ratio', () => {
  const value1 = USD(20);
  const value2 = USD_DAI(4);
  expect(value1.div(value2).toNumber()).toEqual(DAI(5).toNumber());
});

test('dividing by 0 = Infinity', () => {
  expect(USD(10).div(0).toNumber()).toEqual(USD(Infinity).toNumber());
  expect(USD(10).div(DAI(0)).toNumber()).toEqual(USD_DAI(Infinity).toNumber());
});

test('creating a ratio from division', () => {
  const value1 = USD(4);
  const value2 = DAI(20);
  expect(value1.div(value2).toNumber()).toEqual(USD_DAI(0.2).toNumber());
});

test('basic math with ratios', () => {
  const val = USD_DAI(10);
  expect(val.times(10).toNumber()).toEqual(USD_DAI(100).toNumber());
});

test('instanceof Currency', () => {
  expect(ETH(5) instanceof Currency).toBeTruthy();
});

test('isInstance', () => {
  expect(DAI.isInstance(DAI(1))).toBeTruthy();
  expect(DAI.isInstance(MKR(1))).toBeFalsy();

  expect(USD_DAI.isInstance(USD_DAI(1))).toBeTruthy();
  expect(USD_DAI.isInstance(PETH(1))).toBeFalsy();
});


test('constructor flexibility', () => {
  const val = ETH({ toBigNumber: () => new BigNumber(5) });
  expect(val.eq(5)).toBeTruthy();
});