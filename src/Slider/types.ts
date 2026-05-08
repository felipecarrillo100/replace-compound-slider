import React from 'react';
import { LinearScale } from '../scales/LinearScale';
import { DiscreteScale } from '../scales/DiscreteScale';
import { HandleItem, CustomMode } from '../types';

/**
 * The type of the ref forwarded by `<Slider>`.
 * Points directly to the underlying root DOM element.
 * @public
 */
export type SliderHandle = HTMLDivElement;

/**
 * Props for the `<Slider>` component.
 * @public
 */
export interface SliderProps {
  /**
   * The HTML or SVG tag name to use for the slider root element. Defaults to `'div'`.
   * Use `'svg'` together with `flatten` for SVG sliders.
   * @defaultValue 'div'
   */
  component?: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
  /**
   * Inline styles applied to the root element.
   * Tip: at minimum, set `position: 'relative'` and a fixed height.
   */
  rootStyle?: any;
  /**
   * Additional props spread onto the root element (e.g. `aria-label`, `data-testid`).
   */
  rootProps?: { [key: string]: any };
  /**
   * CSS class name applied to the root element.
   */
  className?: string;
  /**
   * A two-element `[min, max]` tuple defining the numeric domain of the slider.
   * The min value must always be smaller than max regardless of the `reversed` prop.
   * @defaultValue [0, 100]
   */
  domain?: ReadonlyArray<number>;
  /**
   * An array of initial (or controlled) handle values.
   * - One value → single-thumb value slider
   * - Two values → range slider
   * - Three or more → multi-handle slider
   *
   * Values outside the domain are clamped to the nearest valid step.
   */
  values: ReadonlyArray<number>;
  /**
   * The increment between discrete step positions.
   * Fractional steps (e.g. `0.5`) are supported.
   * @defaultValue 0.1
   */
  step?: number;
  /**
   * The interaction mode controlling how multiple handles behave relative to each other.
   *
   * | Mode | Behaviour |
   * |------|-----------|
   * | `1`  | **Crossing** – handles can move freely past each other |
   * | `2`  | **Non-crossing** – handles are blocked from crossing (default range behaviour) |
   * | `3`  | **Pushable** – dragging one handle pushes adjacent ones |
   * | `CustomMode` | Supply your own function for full control |
   *
   * @defaultValue 1
   */
  mode?: 1 | 2 | 3 | CustomMode;
  /**
   * Set to `true` to render a vertical slider.
   * The slider will use its height instead of width for position calculations.
   * @defaultValue false
   */
  vertical?: boolean;
  /**
   * Reverses the direction of the slider so that the minimum value is on the right
   * (or bottom for vertical sliders).
   * @defaultValue false
   */
  reversed?: boolean;
  /**
   * Called at the end of every slide interaction and on rail/track clicks.
   * Receives the final committed array of values.
   */
  onChange?: (values: ReadonlyArray<number>) => void;
  /**
   * Called continuously during a drag with the current (in-progress) values.
   * This fires at high frequency — avoid expensive operations here.
   */
  onUpdate?: (values: ReadonlyArray<number>) => void;
  /**
   * Called when a drag interaction begins (`mousedown` / `touchstart` on a handle).
   */
  onSlideStart?: (
    values: ReadonlyArray<number>,
    data: { activeHandleID: string }
  ) => void;
  /**
   * Called when a drag interaction ends (`mouseup` / `touchend`).
   */
  onSlideEnd?: (
    values: ReadonlyArray<number>,
    data: { activeHandleID: string }
  ) => void;
  /**
   * When `true`, all mouse, touch, and keyboard interactions are suppressed.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Renders the slider's child components as siblings of the root element rather than children.
   * Required for SVG sliders where nesting `<div>` inside `<svg>` is invalid.
   * @defaultValue false
   */
  flatten?: boolean;
  /**
   * When `true`, warns in the browser console if handle values are adjusted to fit the domain or step.
   * @defaultValue false
   */
  warnOnChanges?: boolean;
  /**
   * The slider's child components — typically `<Rail>`, `<Handles>`, `<Tracks>`, and `<Ticks>`.
   */
  children?: React.ReactNode;
}

/**
 * Internal state shape for the Slider component.
 * @internal
 */
export interface SliderState {
  step?: number | null;
  values: ReadonlyArray<number> | null;
  domain: ReadonlyArray<number>;
  handles: HandleItem[];
  reversed: boolean | null;
  activeHandleID: string;
  valueToPerc: LinearScale | null;
  valueToStep: DiscreteScale | null;
  pixelToStep: DiscreteScale | null;
}
