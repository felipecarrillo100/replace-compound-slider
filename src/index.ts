/**
 * **replace-compound-slider** — A modernized, React 18/19-compatible fork of
 * [react-compound-slider](https://github.com/sghall/react-compound-slider).
 *
 * This library provides a set of headless, compound slider components with no
 * opinion about markup or styles. You build your own handle, track, rail and
 * tick sub-components and pass them as children. The `Slider` parent streams
 * position and percentage data down so you can render whatever you like.
 *
 * ### Quick Start
 * ```tsx
 * import { Slider, Rail, Handles, Tracks, Ticks } from 'replace-compound-slider';
 *
 * <Slider domain={[0, 100]} values={[20, 60]} step={1}>
 *   <Rail>{ ({ getRailProps }) => <div className="rail" {...getRailProps()} /> }</Rail>
 *   <Handles>
 *     { ({ handles, getHandleProps }) =>
 *       handles.map(h => <MyHandle key={h.id} handle={h} getHandleProps={getHandleProps} />)
 *     }
 *   </Handles>
 * </Slider>
 * ```
 *
 * @packageDocumentation
 */
import {
  SliderItem as _SliderItem,
  HandleItem as _HandleItem,
  EventData as _EventData,
  CustomMode as _CustomMode,
  GetEventData as _GetEventData,
} from './types';

export * from './Slider';
export * from './Rail';
export * from './Ticks';
export * from './Tracks';
export * from './Handles';
export { mode1, mode2, mode3 } from './Slider/modes';

// Named type re-exports (shared types)
export type SliderItem = _SliderItem;
export type HandleItem = _HandleItem;
export type EventData = _EventData;
export type CustomMode = _CustomMode;
export type GetEventData = _GetEventData;

// Sub-module type re-exports for full TypeDoc coverage
export type { SliderHandle, SliderProps } from './Slider/types';
export type { RailObject, RailProps, GetRailProps } from './Rail';
export type { HandlesObject, HandlesProps, GetHandleProps } from './Handles';
export type { TracksObject, TracksProps, TrackItem, GetTrackProps } from './Tracks';
export type { TicksObject, TicksProps } from './Ticks';
