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
  expect(getCurrency(1, 'dai').toString()).toBe('1.00 DAI');
  expect(getCurrency(1, 'mkr').toString()).toBe('1.00 MKR');
  expect(getCurrency(1, 'weth').toString()).toBe('1.00 WETH');
  expect(getCurrency(1, 'peth').toString()).toBe('1.00 PETH');
  expect(getCurrency(1, 'eth').toString()).toBe('1.00 ETH');
});

test('parses an amount + currency class', () => {
  expect(getCurrency(1, ETH).toString()).toBe('1.00 ETH');
  expect(getCurrency(1, PETH).toString()).toBe('1.00 PETH');
  expect(getCurrency(1, WETH).toString()).toBe('1.00 WETH');
  expect(getCurrency(1, DAI).toString()).toBe('1.00 DAI');
  expect(getCurrency(1, MKR).toString()).toBe('1.00 MKR');
});

test('parses an amount + currency as wei', () => {
  const val = 10000000000000000;
  expect(getCurrency(val, ETH.wei).toString()).toBe('0.01 ETH');
  expect(getCurrency(val, PETH.wei).toString()).toBe('0.01 PETH');
  expect(getCurrency(val, WETH.wei).toString()).toBe('0.01 WETH');
  expect(getCurrency(val, DAI.wei).toString()).toBe('0.01 DAI');
  expect(getCurrency(val, MKR.wei).toString()).toBe('0.01 MKR');
});

test('parses an amount + currency as ray', () => {
  const val = 10000000000000000000000000;
  expect(getCurrency(val, ETH.ray).toString()).toBe('0.01 ETH');
  expect(getCurrency(val, PETH.ray).toString()).toBe('0.01 PETH');
  expect(getCurrency(val, WETH.ray).toString()).toBe('0.01 WETH');
  expect(getCurrency(val, DAI.ray).toString()).toBe('0.01 DAI');
  expect(getCurrency(val, MKR.ray).toString()).toBe('0.01 MKR');
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
