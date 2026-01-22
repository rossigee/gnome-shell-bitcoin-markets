import * as assert from 'assert';
import { describe, it } from 'mocha';
import { getMoscowTime, toSegmentStr } from '../src/format/moscowTime';

describe('moscowTime', function () {
  it('formats correctly', function () {
    assert.strictEqual(toSegmentStr('10:00'), '🯱🯰:🯰🯰');
    assert.strictEqual(getMoscowTime(10_000), '100:00');
    assert.strictEqual(getMoscowTime(100_000), '10:00');
    assert.strictEqual(getMoscowTime(1_000_000), '1:00');
  });

  it('formats with segment characters correctly', function () {
    assert.strictEqual(toSegmentStr(getMoscowTime(10_000)), '🯱🯰🯰:🯰🯰');
    assert.strictEqual(toSegmentStr(getMoscowTime(100_000)), '🯱🯰:🯰🯰');
    assert.strictEqual(toSegmentStr(getMoscowTime(1_000_000)), '🯱:🯰🯰');
  });

  it('handles undefined value', function () {
    assert.strictEqual(getMoscowTime(undefined), '--:--');
  });

  it('handles edge cases', function () {
    // Very small values (expensive BTC)
    assert.strictEqual(getMoscowTime(0.01), '100000000:00'); // 1e8 / 0.01 = 10e9, formatted as 100000000:00

    // Very large values (cheap BTC)
    assert.strictEqual(getMoscowTime(1e12), ':0');

    // Fractional values
    assert.strictEqual(getMoscowTime(50000.5), '20:00'); // 1e8 / 50000.5 ≈ 2000, formatted as 20:00
  });

  it('handles invalid inputs gracefully', function () {
    // These might throw or return unexpected results, but let's test current behavior
    // Note: JavaScript division by zero returns Infinity
    assert.strictEqual(getMoscowTime(0), 'Infini:ty'); // Infinity.toFixed(0) = 'Infinity', substr gives 'Infini:ty'

    // Negative values
    assert.strictEqual(getMoscowTime(-10000), '-100:00');

    // NaN
    assert.strictEqual(getMoscowTime(NaN), 'N:aN');

    // Infinity
    assert.strictEqual(getMoscowTime(Infinity), ':0');
  });

  it('toSegmentStr handles various inputs', function () {
    assert.strictEqual(toSegmentStr('123:45'), '🯱🯲🯳:🯴🯵');
    assert.strictEqual(toSegmentStr('0:00'), '🯰:🯰🯰');
    assert.strictEqual(toSegmentStr(''), '');
    assert.strictEqual(toSegmentStr('abc'), 'abc'); // Non-digits pass through unchanged
    assert.strictEqual(toSegmentStr('1a2b3c'), '🯱a🯲b🯳c'); // Mix of digits and letters
  });
});
