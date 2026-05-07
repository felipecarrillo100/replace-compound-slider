import React from 'react';
import { TicksProps } from './types';
import { LinearScale } from '../scales/LinearScale';

const defaultGetEventData = () => ({ value: 0, percent: 0 });

export const Ticks: React.FC<TicksProps> = ({
  children,
  values,
  scale = new LinearScale(),
  count = 10,
  getEventData = defaultGetEventData,
  activeHandleID = '',
}) => {
  const ticks = (values ? values : scale.getTicks(count)).map((value) => ({
    id: `$$-${value}`,
    value,
    percent: scale.getValue(value),
  }));

  const renderedChildren = children({ getEventData, activeHandleID, ticks });

  return renderedChildren ? React.Children.only(renderedChildren) : null;
};

Ticks.displayName = 'Ticks';
