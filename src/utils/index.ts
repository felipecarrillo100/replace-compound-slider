export { warning } from './warning';
export { ticks, tickStep, tickIncrement } from './ticks';

export function callAll<T>(...fns: (((e: T) => void) | undefined)[]) {
  return (e: T) => {
    return fns.forEach(fn => fn && fn(e));
  };
}
