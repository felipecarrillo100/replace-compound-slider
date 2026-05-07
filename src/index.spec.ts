import { describe, it, expect } from 'vitest';
import {
  Slider,
  Rail,
  Handles,
  Ticks,
  Tracks,
  mode1,
  mode2,
  mode3,
} from './index';

describe('react-compound-slider', () => {
  it('Slider should be exported', () => expect(Slider).toBeDefined());
  it('Rail should be exported', () => expect(Rail).toBeDefined());
  it('Handles should be exported', () => expect(Handles).toBeDefined());
  it('Ticks should be exported', () => expect(Ticks).toBeDefined());
  it('Tracks should be exported', () => expect(Tracks).toBeDefined());
  it('should export mode1', () => {
    expect(mode1).toBeDefined();
    expect(typeof mode1).toBe('function');
  });
  it('should export mode2', () => {
    expect(mode2).toBeDefined();
    expect(typeof mode2).toBe('function');
  });
  it('should export mode3', () => {
    expect(mode3).toBeDefined();
    expect(typeof mode3).toBe('function');
  });
});
