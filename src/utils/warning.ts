const warned: Record<string, boolean> = {};

/**
 * Development-only warning utility.
 * Stripped out of production builds by modern bundlers.
 * Includes warn-once logic to prevent console spam.
 */
export function warning(condition: boolean, format: string, ...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning message argument');
    }

    if (!condition && !warned[format]) {
      warned[format] = true;
      let argIndex = 0;
      const message = 'Warning: ' + format.replace(/%s/g, () => args[argIndex++]);
      
      if (typeof console !== 'undefined') {
        console.error(message);
      }

      try {
        // This error is thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {
        // ignore
      }
    }
  }
}
