import { MouseEvent, KeyboardEvent, TouchEvent } from 'react';

/**
 * Represents a single slider handle's position data passed to render functions.
 * @public
 */
export interface SliderItem {
  /** Unique key identifying this handle position. */
  id: string;
  /** The current numeric value of the handle within the domain. */
  value: number;
  /** The position of the handle expressed as a percentage (0–100) of the slider's total width/height. */
  percent: number;
}

/**
 * Internal representation of a handle's state stored by the `Slider` component.
 * @public
 */
export type HandleItem = {
  /** Unique key string for this handle. */
  key: string;
  /** The current numeric value of the handle. */
  val: number;
};

/**
 * The data object returned by `getEventData` containing value and percent at an event position.
 * @public
 */
export interface EventData {
  /** The slider domain value at the event position. */
  value: number;
  /** The percentage position (0–100) at the event position. */
  percent: number;
}

/** @internal */
export type EmitKeyboard = (e: KeyboardEvent<Element>, id?: string) => void;
/** @internal */
export type EmitMouse = (e: MouseEvent<Element>, id?: string) => void;
/** @internal */
export type EmitTouch = (e: TouchEvent<Element>, id?: string) => void;

/**
 * Callback type returned by Rail and Tracks for getting event value data.
 * Accepts a native or synthetic event and returns `{ value, percent }`.
 * @public
 */
export type GetEventData = (e: React.SyntheticEvent | Event) => EventData;

/** @internal */
export type OtherProps = { [key: string]: any };

/** @internal */
export type Interpolator = (x: number) => number;

/**
 * A custom interaction mode function for fine-grained control over how handles move.
 *
 * Receives the current handle state and the proposed next state, and returns the
 * handles array that should actually be committed.
 *
 * @param curr - The current array of handles before the interaction.
 * @param next - The proposed next array of handles after the interaction.
 * @param step - The configured step value of the slider.
 * @param reversed - Whether the slider is in reversed mode.
 * @param getValue - A function that snaps a raw number to the nearest step value.
 * @returns The final array of handles to apply.
 *
 * @example
 * ```tsx
 * // Custom mode: handles can never be closer than 10 apart
 * const myMode: CustomMode = (curr, next) => {
 *   if (next.length === 2 && (next[1].val - next[0].val) < 10) return curr;
 *   return next;
 * };
 * <Slider mode={myMode} ...>
 * ```
 * @public
 */
export type CustomMode = (
  curr: HandleItem[],
  next: HandleItem[],
  step: number,
  reversed: boolean,
  getValue: (x: number) => number
) => HandleItem[];
