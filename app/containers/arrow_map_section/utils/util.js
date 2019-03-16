import { isNaN, isNil } from 'lodash';

export function formatWithSuffixToPrecision(precision, num) {
  function findPowerOf1000(acc, n) {
    if (n < 1000) return acc;
    return findPowerOf1000(acc + 1, n / 1000);
  }

  const suffixTable = {
    0: '', // * 1000^0
    1: 'k', // * 1000^1
    2: 'M', // * 1000^2
    3: 'B', // * 1000^3
    4: 'T', // * 1000^4
  };

  const negativitiy = num / num;

  // constrain to 4 or less; no suffix greater than T (trillion)
  const powerOf1000 = Math.min(findPowerOf1000(0, Math.abs(num)), 4);
  // get corresponding suffix
  const suffix = suffixTable[powerOf1000];

  const theValue = (negativitiy * num / (1000 ** powerOf1000));
  return theValue % 1 !== 0
    ? theValue.toFixed(precision) + suffix
    : theValue.toFixed(0) + suffix;
}

export function formatAmt(value, makeAbsoluteValue = true) {
  if (value === 0 || isNaN(value) || isNil(value)) {
    return 0;
  }
  return makeAbsoluteValue
    ? formatWithSuffixToPrecision(0, Math.abs(value))
    : formatWithSuffixToPrecision(0, value);
}
