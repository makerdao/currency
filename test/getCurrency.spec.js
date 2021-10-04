import { createCurrency, createGetCurrency } from '../src';

const DAI = createCurrency('DAI');
const MKR = createCurrency('MKR');
const ETH = createCurrency('ETH');
const PETH = createCurrency('PETH');
const WETH = createCurrency('WETH');
const USD = createCurrency('USD');

let getCurrency;

beforeAll(() => {
  getCurrency = createGetCurrency({ DAI, MKR, ETH, PETH, WETH, USD });
});

test('passes through Currency instance', () => {
  const val = ETH(5);
  expect(getCurrency(val)).toEqual(val);
});

test('parses an amount and currency symbol', () => {
  expect(getCurrency(1, 'dai').toSymbolString()).toBe('1.00 DAI');
  expect(getCurrency(1, 'mkr').toSymbolString()).toBe('1.00 MKR');
  expect(getCurrency(1, 'weth').toSymbolString()).toBe('1.00 WETH');
  expect(getCurrency(1, 'peth').toSymbolString()).toBe('1.00 PETH');
  expect(getCurrency(1, 'eth').toSymbolString()).toBe('1.00 ETH');
});

test('parses an amount + currency class', () => {
  expect(getCurrency(1, ETH).toSymbolString()).toBe('1.00 ETH');
  expect(getCurrency(1, PETH).toSymbolString()).toBe('1.00 PETH');
  expect(getCurrency(1, WETH).toSymbolString()).toBe('1.00 WETH');
  expect(getCurrency(1, DAI).toSymbolString()).toBe('1.00 DAI');
  expect(getCurrency(1, MKR).toSymbolString()).toBe('1.00 MKR');
});

test('parses an amount + currency as wei', () => {
  const val = 10000000000000000;
  expect(getCurrency(val, ETH.wei).toSymbolString()).toBe('0.01 ETH');
  expect(getCurrency(val, PETH.wei).toSymbolString()).toBe('0.01 PETH');
  expect(getCurrency(val, WETH.wei).toSymbolString()).toBe('0.01 WETH');
  expect(getCurrency(val, DAI.wei).toSymbolString()).toBe('0.01 DAI');
  expect(getCurrency(val, MKR.wei).toSymbolString()).toBe('0.01 MKR');
});

test('parses an amount + currency as ray', () => {
  const val = 10000000000000000000000000;
  expect(getCurrency(val, ETH.ray).toSymbolString()).toBe('0.01 ETH');
  expect(getCurrency(val, PETH.ray).toSymbolString()).toBe('0.01 PETH');
  expect(getCurrency(val, WETH.ray).toSymbolString()).toBe('0.01 WETH');
  expect(getCurrency(val, DAI.ray).toSymbolString()).toBe('0.01 DAI');
  expect(getCurrency(val, MKR.ray).toSymbolString()).toBe('0.01 MKR');
});

test('throws an error if there is no unit', () => {
  expect(() => {
    getCurrency(1);
  }).toThrowError('Amount is not a Currency');
});

test('throws an error if symbol is unrecognized', () => {
  expect(() => {
    getCurrency(1, 'foo');
  }).toThrowError('Couldn\'t find currency for "FOO"');
});
