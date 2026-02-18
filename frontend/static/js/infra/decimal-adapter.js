import DecimalCore from '../vendor/break_eternity.esm.js';

function toDecimal(value) {
  if (value instanceof DecimalCore) return value;
  if (value === null || value === undefined) return new DecimalCore(0);
  return new DecimalCore(value);
}

function toNumber(value) {
  return toDecimal(value).toNumber();
}

function ceilToNumber(value) {
  return Math.ceil(toNumber(value));
}

function floorToNumber(value) {
  return Math.floor(toNumber(value));
}

function maxDecimal(a, b) {
  const da = toDecimal(a);
  const db = toDecimal(b);
  return da.gte(db) ? da : db;
}

function minDecimal(a, b) {
  const da = toDecimal(a);
  const db = toDecimal(b);
  return da.lte(db) ? da : db;
}

export {
  DecimalCore as Decimal,
  toDecimal,
  toNumber,
  ceilToNumber,
  floorToNumber,
  maxDecimal,
  minDecimal,
};

