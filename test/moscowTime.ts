import * as assert from 'assert';
import { describe, it } from 'mocha';
import { getMoscowTime, toSegmentStr } from '../src/format/moscowTime';

describe('moscowTime', function () {
  it('formats correctly', function () {
    // Test segment character conversion
    assert.strictEqual(toSegmentStr('10:00'), '🯱🯰:🯰🯰');
    
    // Test getMoscowTime returns plain numbers
    assert.strictEqual(getMoscowTime(10_000), '100:00');
    assert.strictEqual(getMoscowTime(100_000), '10:00');
    assert.strictEqual(getMoscowTime(1_000_000), '1:00');
    
    // Test segment conversion of getMoscowTime output
    assert.strictEqual(toSegmentStr(getMoscowTime(10_000)), '🯱🯰🯰:🯰🯰');
    assert.strictEqual(toSegmentStr(getMoscowTime(100_000)), '🯱🯰:🯰🯰');
    assert.strictEqual(toSegmentStr(getMoscowTime(1_000_000)), '🯱:🯰🯰');
  });
});
