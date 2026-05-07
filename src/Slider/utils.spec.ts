import { describe, it, expect } from 'vitest';
import * as utils from './utils';

describe('utils', () => {
  describe('getUpdatedHandles', () => {
    it('should return the values array if no change', () => {
      const values = [
        { key: 'key-1', val: 100 },
        { key: 'key-2', val: 200 },
      ];

      const result = utils.getUpdatedHandles(values, 'key-1', 100, false);
      expect(result).toBe(values);
    });

    it('should return new array if there is a change', () => {
      const values = [
        { key: 'key-1', val: 100 },
        { key: 'key-2', val: 200 },
      ];

      const result = utils.getUpdatedHandles(values, 'key-1', 150, false);
      expect(result).not.toBe(values);
    });
  });

  describe('getSortByVal', () => {
    it('should return a function', () => {
      const result = utils.getSortByVal();
      expect(typeof result).toBe('function');
    });

    it('should correctly sort an array of objects with a val prop', () => {
      const vals = [
        { key: 'a', val: 3 },
        { key: 'b', val: 5 },
        { key: 'c', val: 3 },
        { key: 'd', val: 2 },
      ];

      const result1 = [...vals].sort(utils.getSortByVal());
      expect(result1[result1.length - 1].key).toBe('b');

      const result2 = [...vals].sort(utils.getSortByVal(true));
      expect(result2[result2.length - 1].key).toBe('d');
    });
  });
});
