<div style="text-align:center;">
  <a href="https://github.com/felipecarrillo100/replace-compound-slider" target="\_parent">
  <img src="https://user-images.githubusercontent.com/4615775/51296069-8fa30780-19d7-11e9-9399-ace98ee439f0.png"/></a>
</div>

# Replace Compound Slider

🎮 [Try the Live Demo](https://felipecarrillo100.github.io/replace-compound-slider/demo/) — Range, vertical, pushable, time-of-day and more.

📚 [View the API Documentation](https://felipecarrillo100.github.io/replace-compound-slider/)

> [!IMPORTANT]
> This is a modernized fork of the excellent [React Compound Slider](https://github.com/sghall/react-compound-slider) by **Steve Hall**. We have created this fork because the original library is no longer maintained, and we rely on it for our existing production projects. Our goal is to keep this library alive, secure, and compatible with the latest versions of React.

**Maintained by: [Felipe Carrillo](https://github.com/felipecarrillo100)**

## Why Replace Compound Slider?

Welcome to the future. **Replace Compound Slider** is a fully modernized, high-performance slider component for React. It maintains the original's "no-opinion" philosophy about markup and styles while bringing the codebase up to 2026 standards.

### Modernization Highlights
- **React 18 & 19 Support**: Fully refactored to Functional Components and Hooks.
- **Zero Dependencies**: Pure React logic with no runtime dependencies.
- **Zero Vulnerabilities**: All legacy security issues and outdated dependencies have been resolved.
- **Fast Tooling**: Powered by **tsup** (esbuild) and **Vitest** for lightning-fast builds and tests.
- **TypeScript First**: 100% type-safe with modern TypeScript 6.0 patterns.
- **Tree-Shakable**: Clean ESM and CJS outputs for minimal bundle impact.

---

# Installation

```bash
npm install replace-compound-slider
```

---

# Migration from react-compound-slider

Migrating is designed to be a 5-minute task with **zero breaking changes** to the public API.

### 1. Swap Dependencies
```bash
npm uninstall react-compound-slider
npm install replace-compound-slider
```

### 2. Update Imports
```diff
- import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider'
+ import { Slider, Rail, Handles, Tracks, Ticks } from 'replace-compound-slider'
```

### 3. Key Changes to Note
- **Minimum React Version**: Requires **React 16.9+** (as it now uses Hooks internally).
- **Ref Behavior**: The `ref` on the `<Slider />` component now returns the underlying DOM element (`HTMLDivElement`), which is the standard for modern React libraries.

---

### Motivation

This library aims to be a stable platform for creating slider components with a very small impact on bundle size. It is primarily aimed at application developers and npm package maintainers. You can create your own set of controls matched exactly to your application style, but it takes a little more effort than other components out there. You need to be comfortable handling what gets rendered and styling your components to really get maximum value from this library.

### Slider Features

- **Zero Dependencies**: Pure React logic with no runtime impact.
- **Small size**: Minimal bundle footprint.
- **Markup Agnostic**: Makes no assumptions about your markup.
- **SVG Support**: Supports SVG sliders out of the box.
- **Modern TypeScript**: Full type safety for all components.
- **Precise Control**: Complete control over user interactions and styling.
- **Responsive**: Supports mouse, touch, and keyboard events.
- **Flexible Modes**: Crossing, Non-crossing, and Pushable modes supported.

### Example Usage

```jsx
import { Slider, Rail, Handles, Tracks, Ticks } from 'replace-compound-slider'

<Slider
  domain={[0, 100]}
  values={[20, 60]}
  step={1}
>
  <Rail>
    {({ getRailProps }) => (
      <div className="rail-style" {...getRailProps()} />
    )}
  </Rail>
  <Handles>
    {({ handles, getHandleProps }) => (
      <div className="slider-handles">
        {handles.map(handle => (
          <Handle
            key={handle.id}
            handle={handle}
            domain={[0, 100]}
            getHandleProps={getHandleProps}
          />
        ))}
      </div>
    )}
  </Handles>
  <Tracks left={false} right={false}>
    {({ tracks, getTrackProps }) => (
      <div className="slider-tracks">
        {tracks.map(({ id, source, target }) => (
          <Track
            key={id}
            source={source}
            target={target}
            getTrackProps={getTrackProps}
          />
        ))}
      </div>
    )}
  </Tracks>
</Slider>
```

### Acknowledgments

Original artwork and logic by **Steve Hall**.
Modernization and maintenance by **Felipe Carrillo**.
Slider Artwork by Guilhem from the Noun Project.
