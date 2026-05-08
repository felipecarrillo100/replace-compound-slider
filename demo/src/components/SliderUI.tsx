import React from 'react';
import { SliderItem } from 'replace-compound-slider';

// ── Rail ───────────────────────────────────────────────────────────
interface SliderRailProps {
  getRailProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  vertical?: boolean;
}

export const SliderRail: React.FC<SliderRailProps> = ({ getRailProps, vertical = false }) => (
  <>
    <div className={`rail-outer${vertical ? ' vertical' : ''}`} {...getRailProps()} />
    <div className={`rail-inner${vertical ? ' vertical' : ''}`} />
  </>
);

// ── Handle ─────────────────────────────────────────────────────────
interface HandleProps {
  domain: [number, number];
  handle: SliderItem;
  getHandleProps: (id: string, props?: Record<string, unknown>) => Record<string, unknown>;
  disabled?: boolean;
  activeHandleID?: string;
  format?: (v: number) => string;
  vertical?: boolean;
}

export const Handle: React.FC<HandleProps> = ({
  domain: [min, max],
  handle: { id, value, percent },
  getHandleProps,
  disabled = false,
  activeHandleID = '',
  format = (v) => String(v),
  vertical = false,
}) => {
  const isActive = activeHandleID === id;
  const posStyle = vertical
    ? { bottom: `${percent}%` }
    : { left: `${percent}%` };

  const classes = [
    'handle-wrapper',
    isActive ? 'active' : '',
    disabled ? 'disabled' : '',
    vertical ? 'vertical' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={posStyle}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-disabled={disabled}
      {...getHandleProps(id)}
    >
      <span className="handle-tooltip">{format(value)}</span>
      <div className="handle-dot" />
    </div>
  );
};

// ── Track ──────────────────────────────────────────────────────────
interface TrackProps {
  source: SliderItem;
  target: SliderItem;
  getTrackProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  disabled?: boolean;
  vertical?: boolean;
}

export const Track: React.FC<TrackProps> = ({
  source,
  target,
  getTrackProps,
  disabled = false,
  vertical = false,
}) => {
  const style = vertical
    ? {
        bottom: `${source.percent}%`,
        height: `${target.percent - source.percent}%`,
      }
    : {
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
      };

  return (
    <div
      className={`track${disabled ? ' disabled' : ''}${vertical ? ' vertical' : ''}`}
      style={style}
      {...getTrackProps()}
    />
  );
};

// ── Tick ──────────────────────────────────────────────────────────
interface TickProps {
  tick: SliderItem;
  count: number;
  format?: (v: number) => string;
  vertical?: boolean;
}

export const Tick: React.FC<TickProps> = ({
  tick,
  count,
  format = (v) => String(v),
  vertical = false,
}) => {
  const posStyle = vertical
    ? { bottom: `${tick.percent}%` }
    : { left: `${tick.percent}%` };

  const labelStyle = vertical
    ? { bottom: `${tick.percent}%` }
    : {
        left: `${tick.percent}%`,
        width: `${100 / count}%`,
        marginLeft: `${-(100 / count) / 2}%`,
      };

  return (
    <>
      <div className={`tick-mark${vertical ? ' vertical' : ''}`} style={posStyle} />
      <div className={`tick-label${vertical ? ' vertical' : ''}`} style={labelStyle}>
        {format(tick.value)}
      </div>
    </>
  );
};
