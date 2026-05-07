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
import warning from 'warning';
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

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

const noop = () => {};

const compare = (b: any[]) => (m: any, d: any, i: number) => m && b[i] === d;

const equal = (a: any, b: any) => {
  return a === b || (a.length === b.length && a.reduce(compare(b), true));
};

interface RCSComponent {
  type: {
    name: 'Rail' | 'Handles' | 'Ticks' | 'Tracks';
  };
}

const isRCSComponent = (item: React.ReactNode) => {
  if (!isValidElement(item)) {
    return false;
  }

  const type = (item as RCSComponent).type;
  const name = type ? type.name : '';

  return (
    name === Handles.name ||
    name === Rail.name ||
    name === Ticks.name ||
    name === Tracks.name
  );
};

const getNextValue = (
  curr: number,
  step: number,
  domain: ReadonlyArray<number>,
  reversed: boolean
) => {
  const newVal = reversed ? curr - step : curr + step;
  return reversed ? Math.max(domain[0], newVal) : Math.min(domain[1], newVal);
};

const getPrevValue = (
  curr: number,
  step: number,
  domain: ReadonlyArray<number>,
  reversed: boolean
) => {
  const newVal = reversed ? curr + step : curr - step;
  return reversed ? Math.min(domain[1], newVal) : Math.max(domain[0], newVal);
};

const defaultDomain = [0, 100];

export const Slider = forwardRef<SliderHandle, SliderProps>(
  (props, ref) => {
    const {
      step = 0.1,
      values,
      domain = defaultDomain,
      reversed = false,
      vertical = false,
      onUpdate = noop,
      onChange = noop,
      onSlideStart = noop,
      onSlideEnd = noop,
      warnOnChanges = false,
      mode = 1,
      className,
      rootStyle = {},
      rootProps = {},
      component: Comp = 'div',
      disabled = false,
      flatten = false,
      children: sliderChildren,
    } = props;

    const sliderRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => sliderRef.current!);

    // Initialize scales
    const valueToPerc = useMemo(() => new LinearScale(), []);
    const valueToStep = useMemo(() => new DiscreteScale(), []);
    const pixelToStep = useMemo(() => new DiscreteScale(), []);

    const updateScales = useCallback((s: number, d: ReadonlyArray<number>, r: boolean) => {
      const [min, max] = d;
      valueToStep.setStep(s).setRange([min, max]).setDomain([min, max]);

      if (r === true) {
        valueToPerc.setDomain([min, max]).setRange([100, 0]);
        pixelToStep.setStep(s).setRange([max, min]);
      } else {
        valueToPerc.setDomain([min, max]).setRange([0, 100]);
        pixelToStep.setStep(s).setRange([min, max]);
      }

      warning(
        max > min,
        `${prfx} Max must be greater than min (even if reversed). Max is ${max}. Min is ${min}.`
      );
    }, [valueToPerc, valueToStep, pixelToStep]);

    // Initial state calculation
    const [state, setState] = useState(() => {
      updateScales(step, domain, reversed);
      const { handles: initialHandles } = getHandles(
        values || [],
        reversed,
        valueToStep,
        warnOnChanges
      );
      return {
        handles: initialHandles,
        prevProps: { step, domain, reversed, values },
      };
    });

    const { handles, prevProps } = state;
    const [activeHandleID, setActiveHandleID] = useState('');

    const updateHandles = useCallback((updater: (curr: HandleItem[]) => HandleItem[]) => {
      setState(prev => ({
        ...prev,
        handles: updater(prev.handles),
      }));
    }, []);

    // Derived state update (equivalent to getDerivedStateFromProps)
    if (
      step !== prevProps.step ||
      !equal(domain, prevProps.domain) ||
      reversed !== prevProps.reversed ||
      !equal(values, prevProps.values)
    ) {
      updateScales(step, domain, reversed);
      const { handles: nextHandles, changes } = getHandles(
        values || state.handles.map(h => h.val),
        reversed,
        valueToStep,
        warnOnChanges
      );

      setState({
        handles: nextHandles,
        prevProps: { step, domain, reversed, values },
      });

      if (changes || values === undefined || equal(values, prevProps.values || [])) {
        onUpdate(nextHandles.map((d) => d.val));
        onChange(nextHandles.map((d) => d.val));
      }
    }

    useEffect(() => {
      if (sliderRef.current) {
        pixelToStep.setDomain(getSliderDomain(sliderRef.current, vertical));
      }
    }, [vertical, pixelToStep]);


    const getEventData = useCallback((e: React.MouseEvent | React.TouchEvent, isTouch: boolean) => {
      if (sliderRef.current) {
        pixelToStep.setDomain(getSliderDomain(sliderRef.current, vertical));
      }

      let value;
      if (isTouch && (e.nativeEvent instanceof TouchEvent || 'touches' in e.nativeEvent)) {
         // @ts-ignore
        value = pixelToStep.getValue(getTouchPosition(vertical, e.nativeEvent));
      } else if (e.nativeEvent instanceof MouseEvent) {
         // @ts-ignore
        value = pixelToStep.getValue(vertical ? e.nativeEvent.clientY : e.nativeEvent.pageX);
      }
      
      return {
        value,
        // @ts-ignore
        percent: valueToPerc.getValue(value),
      };
    }, [vertical, pixelToStep, valueToPerc]);

    const onMouseMoveRef = useRef<any>();
    onMouseMoveRef.current = (e: MouseEvent) => {
      if (sliderRef.current) {
        pixelToStep.setDomain(getSliderDomain(sliderRef.current, vertical));
      }
      // @ts-ignore
      const updateValue = pixelToStep.getValue(vertical ? e.clientY : e.pageX);
      
      updateHandles((curr) => {
        const nextHandles = getUpdatedHandles(
          curr,
          activeHandleID,
          updateValue,
          reversed
        );
        
        let finalHandles: HandleItem[] = [];
        const { getValue } = valueToStep;
        if (typeof mode === 'function') {
          finalHandles = mode(curr, nextHandles, step, reversed, getValue);
        } else {
          switch (mode) {
            case 1: finalHandles = mode1(curr, nextHandles); break;
            case 2: finalHandles = mode2(curr, nextHandles); break;
            case 3: finalHandles = mode3(curr, nextHandles, step, reversed, getValue); break;
            default: finalHandles = nextHandles;
          }
        }
        onUpdate(finalHandles.map((d) => d.val));
        return finalHandles;
      });
    };

    const onMouseUp = useCallback(() => {
      updateHandles((curr) => {
        onChange(curr.map((d) => d.val));
        onSlideEnd(curr.map((d) => d.val), { activeHandleID });
        return curr;
      });
      setActiveHandleID('');

      if (isBrowser) {
        document.removeEventListener('mousemove', onMouseMoveRef.current);
        document.removeEventListener('mouseup', onMouseUp);
      }
    }, [onChange, onSlideEnd, activeHandleID, updateHandles]);

    // Redefining onMouseMove for better closure handling
    const addMouseEvents = useCallback(() => {
      if (isBrowser) {
        document.addEventListener('mousemove', onMouseMoveRef.current);
        document.addEventListener('mouseup', onMouseUp);
      }
    }, [onMouseUp]);

    const onTouchMoveRef = useRef<any>();
    onTouchMoveRef.current = (e: TouchEvent) => {
      if (isNotValidTouch(e)) return;
      if (sliderRef.current) {
        pixelToStep.setDomain(getSliderDomain(sliderRef.current, vertical));
      }
      // @ts-ignore
      const updateValue = pixelToStep.getValue(getTouchPosition(vertical, e));
      
      updateHandles((curr) => {
        const nextHandles = getUpdatedHandles(
          curr,
          activeHandleID,
          updateValue,
          reversed
        );
        
        let finalHandles: HandleItem[] = [];
        const { getValue } = valueToStep;
        if (typeof mode === 'function') {
          finalHandles = mode(curr, nextHandles, step, reversed, getValue);
        } else {
          switch (mode) {
            case 1: finalHandles = mode1(curr, nextHandles); break;
            case 2: finalHandles = mode2(curr, nextHandles); break;
            case 3: finalHandles = mode3(curr, nextHandles, step, reversed, getValue); break;
            default: finalHandles = nextHandles;
          }
        }
        onUpdate(finalHandles.map((d) => d.val));
        return finalHandles;
      });
    };

    const onTouchEnd = useCallback(() => {
      updateHandles((curr) => {
        onChange(curr.map((d) => d.val));
        onSlideEnd(curr.map((d) => d.val), { activeHandleID });
        return curr;
      });
      setActiveHandleID('');

      if (isBrowser) {
        document.removeEventListener('touchmove', onTouchMoveRef.current);
        document.removeEventListener('touchend', onTouchEnd);
      }
    }, [onChange, onSlideEnd, activeHandleID, updateHandles]);

    const addTouchEvents = useCallback(() => {
      if (isBrowser) {
        document.addEventListener('touchmove', onTouchMoveRef.current);
        document.addEventListener('touchend', onTouchEnd);
      }
    }, [onTouchEnd]);

    const handleRailAndTrackClicks = useCallback((e: MouseEvent | TouchEvent, isTouch: boolean) => {
      if (sliderRef.current) {
        pixelToStep.setDomain(getSliderDomain(sliderRef.current, vertical));
      }

      let updateValue: number;
      if (isTouch) {
        // @ts-ignore
        updateValue = pixelToStep.getValue(getTouchPosition(vertical, e));
      } else {
        // @ts-ignore
        updateValue = pixelToStep.getValue(vertical ? (e as MouseEvent).clientY : (e as MouseEvent).pageX);
      }

      updateHandles((curr) => {
        let updateKey = '';
        let minDiff = Infinity;

        for (let i = 0; i < curr.length; i++) {
          const { key, val } = curr[i];
          const diff = Math.abs(val - updateValue);
          if (diff < minDiff) {
            updateKey = key;
            minDiff = diff;
          }
        }

        const nextHandles = getUpdatedHandles(curr, updateKey, updateValue, reversed);
        
        setActiveHandleID(updateKey);
        
        // Logic from submitUpdate(nextHandles, true)
        let finalHandles: HandleItem[] = [];
        const { getValue } = valueToStep;
        if (typeof mode === 'function') {
          finalHandles = mode(curr, nextHandles, step, reversed, getValue);
        } else {
          switch (mode) {
            case 1: finalHandles = mode1(curr, nextHandles); break;
            case 2: finalHandles = mode2(curr, nextHandles); break;
            case 3: finalHandles = mode3(curr, nextHandles, step, reversed, getValue); break;
            default: finalHandles = nextHandles;
          }
        }
        onUpdate(finalHandles.map((d) => d.val));
        onChange(finalHandles.map((d) => d.val));
        
        isTouch ? addTouchEvents() : addMouseEvents();
        return finalHandles;
      });
    }, [vertical, reversed, step, mode, valueToStep, onUpdate, onChange, addMouseEvents, addTouchEvents, updateHandles]);

    const onStart = useCallback((e: MouseEvent | TouchEvent, handleID: string, isTouch: boolean) => {
      if (!isTouch) {
        e.preventDefault && e.preventDefault();
      }
      e.stopPropagation && e.stopPropagation();

      updateHandles((curr) => {
        const found = curr.find((value) => value.key === handleID);
        if (found) {
          setActiveHandleID(handleID);
          onSlideStart(curr.map((d) => d.val), { activeHandleID: handleID });
          isTouch ? addTouchEvents() : addMouseEvents();
        } else {
          setActiveHandleID('');
          handleRailAndTrackClicks(e, isTouch);
        }
        return curr;
      });
    }, [onSlideStart, addTouchEvents, addMouseEvents, handleRailAndTrackClicks, updateHandles]);

    const onKeyDown = useCallback((e: React.KeyboardEvent, handleID: string) => {
      let validUpKeys = ['ArrowRight', 'ArrowUp'];
      let validDownKeys = ['ArrowDown', 'ArrowLeft'];

      if (vertical) {
        [validUpKeys, validDownKeys] = [validDownKeys, validUpKeys];
      }

      const key = e.key || `${(e as any).keyCode}`;
      if (!validUpKeys.concat(validDownKeys).includes(key)) {
        return;
      }

      e.stopPropagation && e.stopPropagation();
      e.preventDefault && e.preventDefault();

      updateHandles((curr) => {
        const found = curr.find((value) => value.key === handleID);
        if (!found) return curr;

        const currVal = found.val;
        let newVal = currVal;

        if (validUpKeys.includes(key)) {
          newVal = getNextValue(currVal, step, domain, reversed);
        } else if (validDownKeys.includes(key)) {
          newVal = getPrevValue(currVal, step, domain, reversed);
        }

        const nextHandles = curr.map((v) =>
          v.key === handleID ? { key: v.key, val: newVal } : v
        );

        // submitUpdate logic
        let finalHandles: HandleItem[] = [];
        const { getValue } = valueToStep;
        if (typeof mode === 'function') {
          finalHandles = mode(curr, nextHandles, step, reversed, getValue);
        } else {
          switch (mode) {
            case 1: finalHandles = mode1(curr, nextHandles); break;
            case 2: finalHandles = mode2(curr, nextHandles); break;
            case 3: finalHandles = mode3(curr, nextHandles, step, reversed, getValue); break;
            default: finalHandles = nextHandles;
          }
        }
        onUpdate(finalHandles.map((d) => d.val));
        onChange(finalHandles.map((d) => d.val));
        return finalHandles;
      });
    }, [vertical, step, domain, reversed, valueToStep, onUpdate, onChange, updateHandles]);

    const onMouseDown = useCallback((e: React.MouseEvent, handleID: string) => {
      onStart(e.nativeEvent as MouseEvent, handleID, false);
    }, [onStart]);

    const onTouchStart = useCallback((e: React.TouchEvent, handleID: string) => {
      if (isNotValidTouch(e.nativeEvent as TouchEvent)) return;
      onStart(e.nativeEvent as TouchEvent, handleID, true);
    }, [onStart]);

    // Clean up listeners on unmount
    useEffect(() => {
      return () => {
        if (isBrowser) {
          document.removeEventListener('mousemove', onMouseMoveRef.current);
          document.removeEventListener('mouseup', onMouseUp);
          document.removeEventListener('touchmove', onTouchMoveRef.current);
          document.removeEventListener('touchend', onTouchEnd);
        }
      };
    }, [onMouseUp, onTouchEnd]);

    const mappedHandles = useMemo(() => 
      handles.map(({ key, val }) => ({
        id: key,
        value: val,
        // @ts-ignore
        percent: valueToPerc.getValue(val),
      })),
    [handles, valueToPerc]);

    const children = React.Children.map(sliderChildren, (child) => {
      if (isRCSComponent(child)) {
        return React.cloneElement(child as React.ReactElement, {
          scale: valueToPerc,
          handles: mappedHandles,
          activeHandleID,
          getEventData,
          emitKeyboard: disabled ? noop : onKeyDown,
          emitMouse: disabled ? noop : onMouseDown,
          emitTouch: disabled ? noop : onTouchStart,
        });
      }
      return child;
    });

    const rootElement = React.createElement(Comp, {
      ...rootProps,
      style: rootStyle,
      className: className,
      ref: sliderRef,
    }, flatten ? null : children);

    return (
      <>
        {rootElement}
        {flatten ? children : null}
      </>
    );
  }
);

Slider.displayName = 'Slider';
