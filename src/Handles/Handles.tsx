import React from 'react';
import { callAll } from '../utils';
import { OtherProps } from '../types';
import { HandlesProps } from './types';

export const Handles: React.FC<HandlesProps> = ({
  emitKeyboard,
  emitMouse,
  emitTouch,
  activeHandleID = '',
  handles = [],
  children,
}) => {
  const autofocus = (e: React.MouseEvent<Element>) => {
    if (e.target instanceof HTMLElement) {
      e.target.focus();
    }
  };

  const getHandleProps = (id: string, props: OtherProps = {}) => {
    return {
      ...props,
      onKeyDown: callAll<React.KeyboardEvent<Element>>(
        props && props.onKeyDown,
        (e: React.KeyboardEvent<Element>) => emitKeyboard && emitKeyboard(e, id)
      ),
      onMouseDown: callAll<React.MouseEvent<Element>>(
        props && props.onMouseDown,
        autofocus,
        (e: React.MouseEvent) => emitMouse && emitMouse(e, id)
      ),
      onTouchStart: callAll<React.TouchEvent<Element>>(
        props && props.onTouchStart,
        (e: React.TouchEvent<Element>) => emitTouch && emitTouch(e, id)
      ),
    };
  };

  const renderedChildren = children({
    handles,
    activeHandleID,
    getHandleProps,
  });

  return renderedChildren ? React.Children.only(renderedChildren) : null;
};

Handles.displayName = 'Handles';
