import { getUpdatedHandles } from './utils';
import { HandleItem } from '../types';

/**
 * **Mode 1 — Crossing** (default)
 *
 * Handles move freely and may cross each other. No position constraints are applied.
 * This is the most permissive mode, useful for single-thumb sliders or when you
 * want to control ordering yourself.
 *
 * @param _ - The current handle state (unused in this mode).
 * @param next - The proposed next handle state.
 * @returns The next handle state as-is.
 * @public
 */
export function mode1(_: HandleItem[], next: HandleItem[]) {
  return next;
}

/**
 * **Mode 2 — Non-crossing**
 *
 * Handles are blocked from crossing each other or overlapping.
 * Adjacent handles must always maintain a value separation of at least one step.
 * This is the standard behaviour for a range slider.
 *
 * @param curr - The current handle state.
 * @param next - The proposed next handle state.
 * @returns `next` if no handles would cross or overlap; `curr` otherwise.
 * @public
 */
export function mode2(curr: HandleItem[], next: HandleItem[]) {
  for (let i = 0; i < curr.length; i++) {
    if (curr[i].key !== next[i].key) {
      return curr;
    }

    if (next[i + 1] && next[i].val === next[i + 1].val) {
      return curr;
    }
  }

  return next;
}

/**
 * **Mode 3 — Pushable**
 *
 * When a handle is dragged into an adjacent handle, it pushes that neighbour
 * (and any further neighbours in the same direction) along with it.
 * Handles are always kept at least one `step` apart.
 *
 * @param curr - The current handle state.
 * @param next - The proposed next handle state.
 * @param step - The slider step value used to maintain minimum separation.
 * @param reversed - Whether the slider is in reversed mode.
 * @param getValue - Function that snaps a raw number to the nearest valid step.
 * @returns The updated handle array after applying push logic.
 * @public
 */
export function mode3(
  curr: HandleItem[],
  next: HandleItem[],
  step: number,
  reversed: boolean,
  getValue: (x: number) => number
): HandleItem[] {
  let indexForMovingHandle = -1;
  let handleMoveIsPositive = true;

  for (let i = 0; i < curr.length; i++) {
    const c = curr[i];
    const n = next[i];

    // make sure keys are in same order if not return curr
    if (!n || n.key !== c.key) {
      return curr;
    } else if (n.val !== c.val) {
      indexForMovingHandle = i;
      handleMoveIsPositive = n.val - c.val > 0;
    }
  }

  // nothing has changed (shouldn't happen but just in case).
  if (indexForMovingHandle === -1) {
    return curr;
  } else {
    const increment = handleMoveIsPositive ? step : -step;

    for (let i = 0; i < next.length; i++) {
      const n0 = next[i];
      const n1 = next[i + 1];

      if (n1 && n0.val === n1.val) {
        if (i === indexForMovingHandle) {
          const newStep = n1.val + increment;
          if (getValue(newStep) === newStep) {
            const clone = getUpdatedHandles(
              next,
              n1.key,
              n1.val + increment,
              reversed
            );
            const check = mode3(next, clone, step, reversed, getValue);

            if (check === next) {
              return curr;
            } else {
              return check;
            }
          } else {
            return curr;
          }
        } else {
          const newStep = n0.val + increment;
          if (getValue(newStep) === newStep) {
            const clone = getUpdatedHandles(
              next,
              n0.key,
              n0.val + increment,
              reversed
            );
            const check = mode3(next, clone, step, reversed, getValue);

            if (check === next) {
              return curr;
            } else {
              return check;
            }
          } else {
            return curr;
          }
        }
      }
    }
  }

  return next;
}
