import React from 'react';
import { callAll } from '../utils';
import { OtherProps } from '../types';
import { RailProps } from './types';

const NOOP = () => ({ value: 0, percent: 0 });

export const Rail: React.FC<RailProps> = ({
  emitMouse,
  emitTouch,
  getEventData = NOOP,
  activeHandleID = '',
  children,
}) => {
  const getRailProps = (props: OtherProps = {}) => {
    return {
      ...props,
      onMouseDown: callAll<React.MouseEvent<Element>>(
        props && props.onMouseDown,
        emitMouse
      ),
      onTouchStart: callAll(props && props.onTouchStart, emitTouch),
    };
  };

  const renderedChildren = children({
    getEventData,
    activeHandleID,
    getRailProps,
  });

  return renderedChildren ? React.Children.only(renderedChildren) : null;
};

Rail.displayName = 'Rail';
