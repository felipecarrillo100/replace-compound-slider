import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  isValidElement,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { warning } from '../utils';
import { mode1, mode2, mode3 } from './modes';
import {
  isNotValidTouch,
  getTouchPosition,
  getUpdatedHandles,
  getSliderDomain,
  getHandles,
  prfx,
} from './utils';
import { Rail } from '../Rail';
import { Handles } from '../Handles';
import { Ticks } from '../Ticks';
import { Tracks } from '../Tracks';
import { LinearScale } from '../scales/LinearScale';
import { DiscreteScale } from '../scales/DiscreteScale';

import { SliderProps, SliderHandle } from './types';
import { HandleItem } from '../types';

// Fix #5: use displayName (minifier-safe) with .name as dev-only fallback.
// Importing sub-components guarantees their .displayName property is set.
const RCS_DISPLAY_NAMES = new Set([
  Rail.displayName    || Rail.name,
  Handles.displayName || Handles.name,
  Ticks.displayName   || Ticks.name,
  Tracks.displayName  || Tracks.name,
]);
const isRCSComponent = (item: React.ReactNode) => {
  if (!isValidElement(item)) return false;
  const type = item.type as any;
  return RCS_DISPLAY_NAMES.has(type?.displayName || type?.name || '');
};

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

const noop = () => {};

const compare = (b: any[]) => (m: any, d: any, i: number) => m && b[i] === d;
const equal = (a: any, b: any) =>
  a === b || (a.length === b.length && a.reduce(compare(b), true));

const getNextValue = (curr: number, step: number, domain: ReadonlyArray<number>, reversed: boolean) => {
  const newVal = reversed ? curr - step : curr + step;
  return reversed ? Math.max(domain[0], newVal) : Math.min(domain[1], newVal);
};
const getPrevValue = (curr: number, step: number, domain: ReadonlyArray<number>, reversed: boolean) => {
  const newVal = reversed ? curr + step : curr - step;
  return reversed ? Math.min(domain[1], newVal) : Math.max(domain[0], newVal);
};

function applyMode(
  curr: HandleItem[], next: HandleItem[],
  mode: SliderProps['mode'], step: number, reversed: boolean,
  getValue: (x: number) => number
): HandleItem[] {
  if (typeof mode === 'function') return mode(curr, next, step, reversed, getValue);
  switch (mode) {
    case 1: return mode1(curr, next);
    case 2: return mode2(curr, next);
    case 3: return mode3(curr, next, step, reversed, getValue);
    default: return next;
  }
}

const defaultDomain = [0, 100];

export const Slider = forwardRef<SliderHandle, SliderProps>(
  (props, ref) => {
    const {
      step = 0.1, values, domain = defaultDomain,
      reversed = false, vertical = false,
      onUpdate = noop, onChange = noop,
      onSlideStart = noop, onSlideEnd = noop,
      warnOnChanges = false, mode = 1,
      className, rootStyle = {}, rootProps = {},
      component: Comp = 'div', disabled = false,
      flatten = false, children: sliderChildren,
    } = props;

    const sliderRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => sliderRef.current!);

    const valueToPerc = useMemo(() => new LinearScale(), []);
    const valueToStep = useMemo(() => new DiscreteScale(), []);
    const pixelToStep = useMemo(() => new DiscreteScale(), []);

    const updateScales = useCallback((
      s: number, d: ReadonlyArray<number>, r: boolean
    ) => {
      const [min, max] = d;
      valueToStep.setStep(s).setRange([min, max]).setDomain([min, max]);
      if (r) {
        valueToPerc.setDomain([min, max]).setRange([100, 0]);
        pixelToStep.setStep(s).setRange([max, min]);
      } else {
        valueToPerc.setDomain([min, max]).setRange([0, 100]);
        pixelToStep.setStep(s).setRange([min, max]);
      }
      warning(max > min, `${prfx} Max must be greater than min. Max is ${max}. Min is ${min}.`);
    }, [valueToPerc, valueToStep, pixelToStep]);

    const [state, setState] = useState(() => {
      updateScales(step, domain, reversed);
      const { handles: initialHandles } = getHandles(values || [], reversed, valueToStep, warnOnChanges);
      return { handles: initialHandles, prevProps: { step, domain, reversed, values } };
    });

    const { handles, prevProps } = state;
    const [activeHandleID, setActiveHandleID] = useState('');

    // Fix #4: derived state via useEffect, not render-body setState
    useEffect(() => {
      const propsChanged =
        step !== prevProps.step ||
        !equal(domain, prevProps.domain) ||
        reversed !== prevProps.reversed;
      const valuesChanged = !equal(values, prevProps.values || []);
      if (!propsChanged && !valuesChanged) return;
      updateScales(step, domain, reversed);
      const { handles: nextHandles, changes } = getHandles(
        values || handles.map(h => h.val), reversed, valueToStep, warnOnChanges
      );
      setState({ handles: nextHandles, prevProps: { step, domain, reversed, values } });
      if (propsChanged || changes) {
        onUpdate(nextHandles.map(d => d.val));
        onChange(nextHandles.map(d => d.val));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, domain, reversed, vertical, values]);

    // Set pixelToStep domain on mount
    useEffect(() => {
      if (sliderRef.current) {
        pixelToStep.setDomain(getSliderDomain(sliderRef.current, vertical));
      }
    }, [vertical, pixelToStep]);

    // Fix #2: For vertical sliders, we flip the raw clientY before feeding it to
    // pixelToStep, rather than inverting the range (which breaks DiscreteScale.clamp).
    // pixelToStep always keeps range=[min,max]. We map: clientY → (sliderBottom - clientY + sliderTop)
    // so that dragging UP increases the value.
    const getVerticalPixel = useCallback((clientY: number) => {
      if (!sliderRef.current) return clientY;
      const { top, bottom } = sliderRef.current.getBoundingClientRect();
      return bottom - (clientY - top);  // mirror clientY within the slider bounds
    }, []);

    const getPixelValue = useCallback((e: MouseEvent | TouchEvent, isTouch: boolean): number => {
      if (sliderRef.current) {
        pixelToStep.setDomain(getSliderDomain(sliderRef.current, vertical));
      }
      let raw: number;
      if (isTouch) {
        raw = getTouchPosition(vertical, e as any);
      } else {
        raw = vertical ? (e as MouseEvent).clientY : (e as MouseEvent).pageX;
      }
      if (vertical && !reversed) raw = getVerticalPixel(raw as number);
      // @ts-ignore
      return pixelToStep.getValue(raw);
    }, [vertical, reversed, pixelToStep, getVerticalPixel]);

    const getEventData = useCallback((e: React.MouseEvent | React.TouchEvent, isTouch: boolean) => {
      if (sliderRef.current) {
        pixelToStep.setDomain(getSliderDomain(sliderRef.current, vertical));
      }
      let value: number | undefined;
      if (isTouch && 'touches' in e.nativeEvent) {
        const raw = getTouchPosition(vertical, e.nativeEvent as any);
        const mirroredRaw = (vertical && !reversed) ? getVerticalPixel(raw) : raw;
        // @ts-ignore
        value = pixelToStep.getValue(mirroredRaw);
      } else if (e.nativeEvent instanceof MouseEvent) {
        const raw = vertical ? e.nativeEvent.clientY : e.nativeEvent.pageX;
        const mirroredRaw = (vertical && !reversed) ? getVerticalPixel(raw) : raw;
        // @ts-ignore
        value = pixelToStep.getValue(mirroredRaw);
      }
      // @ts-ignore
      return { value, percent: valueToPerc.getValue(value) };
    }, [vertical, reversed, pixelToStep, valueToPerc, getVerticalPixel]);

    // ── Stable ref holders — updated every render to capture latest closure values ──────
    // These are the LOGIC functions. We never register them directly with document.
    const onMouseMoveLogic = useRef<(e: MouseEvent) => void>(() => {});
    onMouseMoveLogic.current = (e: MouseEvent) => {
      const updateValue = getPixelValue(e, false);
      setState(prev => {
        const nextHandles = getUpdatedHandles(prev.handles, activeHandleID, updateValue, reversed);
        const { getValue } = valueToStep;
        const finalHandles = applyMode(prev.handles, nextHandles, mode, step, reversed, getValue);
        onUpdate(finalHandles.map(d => d.val));
        return { ...prev, handles: finalHandles };
      });
    };

    const onMouseUpLogic = useRef<() => void>(() => {});
    onMouseUpLogic.current = () => {
      setState(prev => {
        onChange(prev.handles.map(d => d.val));
        onSlideEnd(prev.handles.map(d => d.val), { activeHandleID });
        return prev;
      });
      setActiveHandleID('');
      document.removeEventListener('mousemove', stableMouseMove.current);
      document.removeEventListener('mouseup', stableMouseUp.current);
    };

    const onTouchMoveLogic = useRef<(e: TouchEvent) => void>(() => {});
    onTouchMoveLogic.current = (e: TouchEvent) => {
      if (isNotValidTouch(e)) return;
      e.preventDefault?.(); // Prevent page scrolling during drag
      const updateValue = getPixelValue(e, true);
      setState(prev => {
        const nextHandles = getUpdatedHandles(prev.handles, activeHandleID, updateValue, reversed);
        const { getValue } = valueToStep;
        const finalHandles = applyMode(prev.handles, nextHandles, mode, step, reversed, getValue);
        onUpdate(finalHandles.map(d => d.val));
        return { ...prev, handles: finalHandles };
      });
    };

    const onTouchEndLogic = useRef<() => void>(() => {});
    onTouchEndLogic.current = () => {
      setState(prev => {
        onChange(prev.handles.map(d => d.val));
        onSlideEnd(prev.handles.map(d => d.val), { activeHandleID });
        return prev;
      });
      setActiveHandleID('');
      document.removeEventListener('touchmove', stableTouchMove.current);
      document.removeEventListener('touchend', stableTouchEnd.current);
    };

    // Fix #1: STABLE wrapper functions — created once, never change identity.
    // They delegate to the logic refs so they always call the latest handler.
    // These are what gets registered/removed from document.
    const stableMouseMove = useRef((e: MouseEvent) => onMouseMoveLogic.current(e));
    const stableMouseUp   = useRef(() => onMouseUpLogic.current());
    const stableTouchMove = useRef((e: TouchEvent) => onTouchMoveLogic.current(e));
    const stableTouchEnd  = useRef(() => onTouchEndLogic.current());

    const addMouseEvents = useCallback(() => {
      if (isBrowser) {
        document.addEventListener('mousemove', stableMouseMove.current);
        document.addEventListener('mouseup',   stableMouseUp.current);
      }
    }, []);

    const addTouchEvents = useCallback(() => {
      if (isBrowser) {
        document.addEventListener('touchmove', stableTouchMove.current, { passive: false });
        document.addEventListener('touchend',  stableTouchEnd.current);
      }
    }, []);

    // Cleanup on unmount — empty deps so never fires mid-drag
    useEffect(() => {
      return () => {
        if (isBrowser) {
          document.removeEventListener('mousemove', stableMouseMove.current);
          document.removeEventListener('mouseup',   stableMouseUp.current);
          document.removeEventListener('touchmove', stableTouchMove.current);
          document.removeEventListener('touchend',  stableTouchEnd.current);
        }
      };
    }, []);

    // Fix #3: handleRailAndTrackClicks — no side effects inside setState
    const handleRailAndTrackClicks = useCallback((e: MouseEvent | TouchEvent, isTouch: boolean) => {
      const updateValue = getPixelValue(e, isTouch);
      let updateKey = '';
      let minDiff = Infinity;
      for (const h of handles) {
        const diff = Math.abs(h.val - updateValue);
        if (diff < minDiff) { updateKey = h.key; minDiff = diff; }
      }
      setState(prev => {
        const nextHandles = getUpdatedHandles(prev.handles, updateKey, updateValue, reversed);
        const { getValue } = valueToStep;
        const finalHandles = applyMode(prev.handles, nextHandles, mode, step, reversed, getValue);
        onUpdate(finalHandles.map(d => d.val));
        onChange(finalHandles.map(d => d.val));
        return { ...prev, handles: finalHandles };
      });
      setActiveHandleID(updateKey);
      isTouch ? addTouchEvents() : addMouseEvents();
    }, [getPixelValue, handles, reversed, step, mode, valueToStep, onUpdate, onChange, addMouseEvents, addTouchEvents]);

    // Fix #3: onStart — side effects outside setState
    const onStart = useCallback((e: MouseEvent | TouchEvent, handleID: string, isTouch: boolean) => {
      if (!isTouch) e.preventDefault?.();
      e.stopPropagation?.();
      const found = handles.find(v => v.key === handleID);
      if (found) {
        setActiveHandleID(handleID);
        onSlideStart(handles.map(d => d.val), { activeHandleID: handleID });
        isTouch ? addTouchEvents() : addMouseEvents();
      } else {
        setActiveHandleID('');
        handleRailAndTrackClicks(e, isTouch);
      }
    }, [handles, onSlideStart, addTouchEvents, addMouseEvents, handleRailAndTrackClicks]);

    const onKeyDown = useCallback((e: React.KeyboardEvent, handleID: string) => {
      let validUpKeys = ['ArrowRight', 'ArrowUp'];
      let validDownKeys = ['ArrowDown', 'ArrowLeft'];
      if (vertical) [validUpKeys, validDownKeys] = [validDownKeys, validUpKeys];
      const key = e.key || `${(e as any).keyCode}`;
      if (!validUpKeys.concat(validDownKeys).includes(key)) return;
      e.stopPropagation?.();
      e.preventDefault?.();
      setState(prev => {
        const found = prev.handles.find(v => v.key === handleID);
        if (!found) return prev;
        const currVal = found.val;
        const newVal = validUpKeys.includes(key)
          ? getNextValue(currVal, step, domain, reversed)
          : getPrevValue(currVal, step, domain, reversed);
        const nextHandles = prev.handles.map(v => v.key === handleID ? { key: v.key, val: newVal } : v);
        const { getValue } = valueToStep;
        const finalHandles = applyMode(prev.handles, nextHandles, mode, step, reversed, getValue);
        onUpdate(finalHandles.map(d => d.val));
        onChange(finalHandles.map(d => d.val));
        return { ...prev, handles: finalHandles };
      });
    }, [vertical, step, domain, reversed, valueToStep, onUpdate, onChange]);

    const onMouseDown = useCallback((e: React.MouseEvent, handleID: string) => {
      onStart(e.nativeEvent as MouseEvent, handleID, false);
    }, [onStart]);

    const onTouchStart = useCallback((e: React.TouchEvent, handleID: string) => {
      if (isNotValidTouch(e.nativeEvent as TouchEvent)) return;
      onStart(e.nativeEvent as TouchEvent, handleID, true);
    }, [onStart]);

    const mappedHandles = useMemo(() =>
      handles.map(({ key, val }) => ({
        id: key, value: val,
        // @ts-ignore
        percent: valueToPerc.getValue(val),
      })),
    [handles, valueToPerc]);

    const children = React.Children.map(sliderChildren, (child) => {
      if (isRCSComponent(child)) {
        return React.cloneElement(child as React.ReactElement, {
          scale: valueToPerc, handles: mappedHandles, activeHandleID, getEventData,
          emitKeyboard: disabled ? noop : onKeyDown,
          emitMouse:    disabled ? noop : onMouseDown,
          emitTouch:    disabled ? noop : onTouchStart,
        });
      }
      return child;
    });

    const rootElement = React.createElement(Comp,
      { ...rootProps, style: rootStyle, className, ref: sliderRef },
      flatten ? null : children
    );

    return <>{rootElement}{flatten ? children : null}</>;
  }
);

Slider.displayName = 'Slider';
