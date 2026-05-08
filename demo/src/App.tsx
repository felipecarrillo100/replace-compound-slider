import React, { useState, useEffect, useCallback } from 'react';
import { Slider, Rail, Handles, Tracks, Ticks } from 'replace-compound-slider';
import { SliderRail, Handle, Track, Tick } from './components/SliderUI';

// ─── Theme system ────────────────────────────────────────────────
type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('rcs-demo-theme') as Theme | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ─── Helpers ─────────────────────────────────────────────────────
const DOMAIN_100: [number, number] = [0, 100];
const DOMAIN_200: [number, number] = [0, 200];
const DOMAIN_1000: [number, number] = [0, 1000];

// Date/time slider: range over 24 hours in minutes from midnight
const DAY_DOMAIN: [number, number] = [0, 1440]; // minutes in a day
function minutesToTime(mins: number) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ─── Code snippet helper ─────────────────────────────────────────
const CodeSnippet: React.FC<{ children: string }> = ({ children }) => (
  <pre className="code-block">{children.trim()}</pre>
);

// ─── Main App ────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('rcs-demo-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // ── Example state ──────────────────────────────────────────────
  const [single, setSingle] = useState([40]);
  const [range, setRange] = useState([20, 70]);
  const [vertical, setVertical] = useState([30, 65]);
  const [pushable, setPushable] = useState([15, 45, 75]);
  const [ticked, setTicked] = useState([250, 750]);
  const [custom, setCustom] = useState([3.5]);
  const [timeRange, setTimeRange] = useState([480, 1020]); // 08:00 – 17:00
  const [disabled] = useState([35, 65]);
  const [fiveHandles, setFiveHandles] = useState([10, 25, 50, 75, 90]);
  // Live updates demo — onUpdate fires every tick, onChange fires on release
  const [liveValue, setLiveValue] = useState([35]);
  const [committedValue, setCommittedValue] = useState([35]);
  const [isDragging, setIsDragging] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className="demo-wrapper">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="demo-header">
        <div className="demo-header-left">
          <h1 className="demo-title">
            <span>replace-compound-slider</span>
          </h1>
          <p className="demo-subtitle">
            A headless, fully composable React slider — no opinions on markup or styles.
          </p>
          <nav className="demo-links">
            <a
              href="https://felipecarrillo100.github.io/replace-compound-slider/"
              className="demo-link"
              target="_blank"
              rel="noreferrer"
            >
              📚 API Docs
            </a>
            <a
              href="https://github.com/felipecarrillo100/replace-compound-slider"
              className="demo-link"
              target="_blank"
              rel="noreferrer"
            >
              ⭐ GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/replace-compound-slider"
              className="demo-link"
              target="_blank"
              rel="noreferrer"
            >
              📦 npm
            </a>
          </nav>
        </div>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle colour theme">
          {isDark ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              Light mode
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Dark mode
            </>
          )}
        </button>
      </header>

      {/* ── Gallery ────────────────────────────────────────────── */}
      <main className="demo-gallery">

        {/* 1. Single Value */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Single Value Slider</h2>
            <span className="card-badge">mode={1}</span>
          </div>
          <p className="card-description">
            The simplest case — one handle, one value. Drag or use arrow keys.
          </p>
          <div className="value-display">
            <span className={`value-chip${single.length > 0 ? ' active' : ''}`}>
              value: {single[0]}
            </span>
          </div>
          <div className="slider-container">
            <Slider
              className="slider-root"
              domain={DOMAIN_100}
              values={single}
              step={1}
              onChange={v => setSingle([...v])}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DOMAIN_100}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
            </Slider>
          </div>
          <CodeSnippet>{`<Slider domain={[0, 100]} values={[${single[0]}]} step={1}>
  <Rail>{ ({ getRailProps }) => <MyRail {...getRailProps()} /> }</Rail>
  <Handles>{ ({ handles, getHandleProps }) =>
    handles.map(h => <MyHandle key={h.id} {...getHandleProps(h.id)} />)
  }</Handles>
  <Tracks right={false}>{ ({ tracks, getTrackProps }) =>
    tracks.map(t => <MyTrack key={t.id} {...getTrackProps()} />)
  }</Tracks>
</Slider>`}</CodeSnippet>
        </section>

        {/* 2. Range Slider */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Range Slider</h2>
            <span className="card-badge mode">mode={2} — non-crossing</span>
          </div>
          <p className="card-description">
            Two handles that cannot cross. Uses <code>mode=2</code> to block overlapping.
            Tracks are rendered between both handles and between handles and the rail ends.
          </p>
          <div className="value-display">
            {range.map((v, i) => (
              <span key={i} className="value-chip active">{['min', 'max'][i]}: {v}</span>
            ))}
          </div>
          <div className="slider-container">
            <Slider
              domain={DOMAIN_100}
              values={range}
              step={1}
              mode={2}
              onChange={v => setRange([...v])}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DOMAIN_100}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks left={false} right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
            </Slider>
          </div>
          <CodeSnippet>{`<Slider domain={[0, 100]} values={[${range.join(', ')}]} mode={2}>
  {/* Tracks left/right=false → only the inner segment is highlighted */}
  <Tracks left={false} right={false}>
    {({ tracks, getTrackProps }) => tracks.map(t =>
      <MyTrack key={t.id} source={t.source} target={t.target} {...getTrackProps()} />
    )}
  </Tracks>
</Slider>`}</CodeSnippet>
        </section>

        {/* 3. Vertical Slider */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Vertical Range Slider</h2>
            <span className="card-badge vertical">vertical</span>
          </div>
          <p className="card-description">
            Set <code>vertical=true</code> and give the root a fixed height. The slider measures
            its height instead of width for position calculations.
          </p>
          <div className="vertical-card-body">
            <div className="slider-container vertical">
              <Slider
                domain={DOMAIN_100}
                values={vertical}
                step={1}
                mode={2}
                vertical
                onChange={v => setVertical([...v])}
                rootStyle={{ position: 'relative', width: 36, height: 200 }}
              >
                <Rail>
                  {({ getRailProps }) => <SliderRail getRailProps={getRailProps} vertical />}
                </Rail>
                <Handles>
                  {({ handles, getHandleProps, activeHandleID }) => (
                    <>
                      {handles.map(h => (
                        <Handle
                          key={h.id}
                          handle={h}
                          domain={DOMAIN_100}
                          getHandleProps={getHandleProps}
                          activeHandleID={activeHandleID}
                          vertical
                        />
                      ))}
                    </>
                  )}
                </Handles>
                <Tracks left={false} right={false}>
                  {({ tracks, getTrackProps }) => (
                    <>
                      {tracks.map(({ id, source, target }) => (
                        <Track key={id} source={source} target={target} getTrackProps={getTrackProps} vertical />
                      ))}
                    </>
                  )}
                </Tracks>
              </Slider>
            </div>
            <div className="vertical-card-info">
              <div className="value-display" style={{ flexDirection: 'column' }}>
                <span className="value-chip active">bottom: {vertical[0]}</span>
                <span className="value-chip active">top: {vertical[1]}</span>
              </div>
              <CodeSnippet>{`<Slider
  vertical
  domain={[0, 100]}
  values={[${vertical.join(', ')}]}
  rootStyle={{ height: 200, width: 36 }}
>
  ...
</Slider>`}</CodeSnippet>
            </div>
          </div>
        </section>

        {/* 4. Pushable (mode 3) */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Pushable Handles</h2>
            <span className="card-badge mode">mode={3} — pushable</span>
          </div>
          <p className="card-description">
            Three handles in <code>mode=3</code>. Dragging one handle into an adjacent one
            pushes it along, keeping all handles at least one step apart.
          </p>
          <div className="value-display">
            {pushable.map((v, i) => (
              <span key={i} className="value-chip active">h{i + 1}: {v}</span>
            ))}
          </div>
          <div className="slider-container">
            <Slider
              domain={DOMAIN_100}
              values={pushable}
              step={5}
              mode={3}
              onChange={v => setPushable([...v])}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DOMAIN_100}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks left={false} right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
            </Slider>
          </div>
          <CodeSnippet>{`<Slider
  domain={[0, 100]} step={5}
  values={[${pushable.join(', ')}]}
  mode={3}   {/* pushable — try pushing the middle handle! */}
>`}</CodeSnippet>
        </section>

        {/* 5. Ticks */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Slider with Ticks</h2>
            <span className="card-badge">{'<Ticks count={5}>'}</span>
          </div>
          <p className="card-description">
            Use the <code>&lt;Ticks&gt;</code> sub-component to generate evenly-spaced, human-readable
            labels. The <code>count</code> prop is approximate — the library picks "nice" numbers.
          </p>
          <div className="value-display">
            {ticked.map((v, i) => (
              <span key={i} className="value-chip active">{['from', 'to'][i]}: {v}</span>
            ))}
          </div>
          <div className="slider-container" style={{ paddingBottom: 40 }}>
            <Slider
              domain={DOMAIN_1000}
              values={ticked}
              step={50}
              mode={2}
              onChange={v => setTicked([...v])}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DOMAIN_1000}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks left={false} right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
              <Ticks count={5}>
                {({ ticks }) => (
                  <>
                    {ticks.map(tick => (
                      <Tick key={tick.id} tick={tick} count={ticks.length} />
                    ))}
                  </>
                )}
              </Ticks>
            </Slider>
          </div>
          <CodeSnippet>{`<Ticks count={5}>
  {({ ticks }) =>
    ticks.map(t => <MyTick key={t.id} tick={t} count={ticks.length} />)
  }
</Ticks>`}</CodeSnippet>
        </section>

        {/* 6. Custom Step / Fractional */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Fractional Steps</h2>
            <span className="card-badge">step={0.5}</span>
          </div>
          <p className="card-description">
            The <code>step</code> prop accepts decimals. Here we use <code>step=0.5</code> over a
            domain of <code>[0, 10]</code> and display the value with one decimal place.
          </p>
          <div className="value-display">
            <span className="value-chip active">value: {custom[0].toFixed(1)}</span>
          </div>
          <div className="slider-container">
            <Slider
              domain={[0, 10]}
              values={custom}
              step={0.5}
              onChange={v => setCustom([...v])}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={[0, 10]}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                        format={v => v.toFixed(1)}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
              <Ticks values={[0, 2.5, 5, 7.5, 10]}>
                {({ ticks }) => (
                  <>
                    {ticks.map(tick => (
                      <Tick key={tick.id} tick={tick} count={ticks.length} format={v => v.toFixed(1)} />
                    ))}
                  </>
                )}
              </Ticks>
            </Slider>
          </div>
          <CodeSnippet>{`<Slider domain={[0, 10]} values={[${custom[0].toFixed(1)}]} step={0.5}>
  {/* Ticks with explicit values prop for fine control */}
  <Ticks values={[0, 2.5, 5, 7.5, 10]}>
    {({ ticks }) => ticks.map(t =>
      <MyTick key={t.id} tick={t} format={v => v.toFixed(1)} />
    )}
  </Ticks>
</Slider>`}</CodeSnippet>
        </section>

        {/* 7. Time-of-Day Range */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Time-of-Day Selector</h2>
            <span className="card-badge mode">domain: minutes</span>
          </div>
          <p className="card-description">
            The domain is mapped to minutes-from-midnight (0–1440). A custom <code>format</code> function
            converts each value to an <code>HH:MM</code> string. Step is 15 minutes.
          </p>
          <div className="date-display">
            ⏰ {minutesToTime(timeRange[0])} — {minutesToTime(timeRange[1])}
            &nbsp;&nbsp;({Math.round((timeRange[1] - timeRange[0]) / 60)}h {(timeRange[1] - timeRange[0]) % 60}m)
          </div>
          <div className="slider-container" style={{ paddingBottom: 40 }}>
            <Slider
              domain={DAY_DOMAIN}
              values={timeRange}
              step={15}
              mode={2}
              onChange={v => setTimeRange([...v])}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DAY_DOMAIN}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                        format={minutesToTime}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks left={false} right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
              <Ticks values={[0, 360, 720, 1080, 1440]}>
                {({ ticks }) => (
                  <>
                    {ticks.map(tick => (
                      <Tick key={tick.id} tick={tick} count={ticks.length} format={minutesToTime} />
                    ))}
                  </>
                )}
              </Ticks>
            </Slider>
          </div>
          <CodeSnippet>{`// domain = [0, 1440] (minutes in a day), step = 15
const toTime = (mins) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return \`\${h}:\${m}\`;
};

<Slider domain={[0, 1440]} values={[${timeRange.join(', ')}]} step={15}>
  <Handles>
    {({ handles, getHandleProps }) => handles.map(h =>
      <Handle key={h.id} format={toTime} {...getHandleProps(h.id)} />
    )}
  </Handles>
</Slider>`}</CodeSnippet>
        </section>

        {/* 8. Large Domain */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Large Domain — Step 10</h2>
            <span className="card-badge">domain=[0, 200]</span>
          </div>
          <p className="card-description">
            Range slider over <code>[0, 200]</code> with <code>step=10</code>.
            Demonstrates how the library handles larger numeric domains gracefully.
          </p>
          <div className="value-display">
            <span className="value-chip active">from: {range[0] * 2}</span>
            <span className="value-chip active">to: {range[1] * 2}</span>
          </div>
          <div className="slider-container" style={{ paddingBottom: 40 }}>
            <Slider
              domain={DOMAIN_200}
              values={[range[0] * 2, range[1] * 2]}
              step={10}
              mode={2}
              onChange={v => setRange([v[0] / 2, v[1] / 2])}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DOMAIN_200}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks left={false} right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
              <Ticks count={5}>
                {({ ticks }) => (
                  <>
                    {ticks.map(tick => (
                      <Tick key={tick.id} tick={tick} count={ticks.length} />
                    ))}
                  </>
                )}
              </Ticks>
            </Slider>
          </div>
        </section>

        {/* 9. Disabled */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Disabled State</h2>
            <span className="card-badge disabled">disabled</span>
          </div>
          <p className="card-description">
            Pass <code>disabled=true</code> to suppress all mouse, touch, and keyboard events.
            Style the handles and tracks with a muted colour to signal the inactive state.
          </p>
          <div className="value-display">
            {disabled.map((v, i) => (
              <span key={i} className="value-chip">{['min', 'max'][i]}: {v}</span>
            ))}
          </div>
          <div className="slider-container">
            <Slider
              domain={DOMAIN_100}
              values={disabled}
              step={1}
              mode={2}
              disabled
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DOMAIN_100}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                        disabled
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks left={false} right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} disabled />
                    ))}
                  </>
                )}
              </Tracks>
            </Slider>
          </div>
          <CodeSnippet>{`<Slider disabled domain={[0, 100]} values={[35, 65]}>
  {/* All interactions are blocked. */}
  {/* Apply --accent-handle-disabled colour in your handle style. */}
</Slider>`}</CodeSnippet>
        </section>

        {/* 10. Five Handles */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Five-Handle Slider</h2>
            <span className="card-badge mode">mode={2} — 5 handles</span>
          </div>
          <p className="card-description">
            Five handles in <code>mode=2</code> (non-crossing). Each handle independently
            selects a value within <code>[0, 100]</code>. All 5 handles are rendered with
            their own tooltip showing the current value.
          </p>
          <div className="value-display">
            {fiveHandles.map((v, i) => (
              <span key={i} className="value-chip active">h{i + 1}: {v}</span>
            ))}
          </div>
          <div className="slider-container" style={{ paddingBottom: 40 }}>
            <Slider
              domain={DOMAIN_100}
              values={fiveHandles}
              step={1}
              mode={2}
              onChange={v => setFiveHandles([...v])}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DOMAIN_100}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks left={false} right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
              <Ticks count={5}>
                {({ ticks }) => (
                  <>
                    {ticks.map(tick => (
                      <Tick key={tick.id} tick={tick} count={ticks.length} />
                    ))}
                  </>
                )}
              </Ticks>
            </Slider>
          </div>
          <CodeSnippet>{`<Slider domain={[0, 100]} values={[${fiveHandles.join(', ')}]} mode={2}>
  <Handles>
    {({ handles, getHandleProps, activeHandleID }) =>
      handles.map(h => (
        <Handle key={h.id} handle={h} getHandleProps={getHandleProps}
                activeHandleID={activeHandleID} />
      ))
    }
  </Handles>
  {/* Tracks renders segments between every adjacent pair of handles */}
  <Tracks left={false} right={false}>
    {({ tracks, getTrackProps }) =>
      tracks.map(({ id, source, target }) => (
        <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
      ))
    }
  </Tracks>
</Slider>`}</CodeSnippet>
        </section>

        {/* Live Updates */}
        <section className="demo-card">
          <div className="card-header">
            <h2 className="card-title">Live Updates</h2>
            <span className="card-badge mode">onUpdate vs onChange</span>
          </div>
          <p className="card-description">
            <code>onUpdate</code> fires on <strong>every drag tick</strong> — ideal for live
            previews. <code>onChange</code> fires only on <strong>release</strong> — ideal for
            committing the final value. Use both together to show a live preview while
            only writing to state on release.
          </p>
          <div className="value-display">
            <span className={`value-chip${isDragging ? ' active' : ''}`}>
              {isDragging ? '🟢' : '⚪'} live (onUpdate): {liveValue[0]}
            </span>
            <span className="value-chip">
              ✅ committed (onChange): {committedValue[0]}
            </span>
          </div>
          <div className="slider-container">
            <Slider
              domain={DOMAIN_100}
              values={committedValue}
              step={1}
              onUpdate={v => { setLiveValue([...v]); setIsDragging(true); }}
              onChange={v => { setCommittedValue([...v]); setLiveValue([...v]); setIsDragging(false); }}
              rootStyle={{ position: 'relative', width: '100%', height: 36 }}
            >
              <Rail>
                {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
              </Rail>
              <Handles>
                {({ handles, getHandleProps, activeHandleID }) => (
                  <>
                    {handles.map(h => (
                      <Handle
                        key={h.id}
                        handle={h}
                        domain={DOMAIN_100}
                        getHandleProps={getHandleProps}
                        activeHandleID={activeHandleID}
                      />
                    ))}
                  </>
                )}
              </Handles>
              <Tracks right={false}>
                {({ tracks, getTrackProps }) => (
                  <>
                    {tracks.map(({ id, source, target }) => (
                      <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                    ))}
                  </>
                )}
              </Tracks>
            </Slider>
          </div>
          <CodeSnippet>{`<Slider
  domain={[0, 100]} values={[${committedValue[0]}]} step={1}
  onUpdate={v => setLiveValue(v)}   // fires every drag tick
  onChange={v => setCommitted(v)}   // fires only on release
>
  ...
</Slider>`}</CodeSnippet>
        </section>

      </main>

      <footer className="demo-footer">
        <p>
          Built with{' '}
          <a href="https://github.com/felipecarrillo100/replace-compound-slider" target="_blank" rel="noreferrer">
            replace-compound-slider
          </a>{' '}
          ·{' '}
          <a href="https://felipecarrillo100.github.io/replace-compound-slider/" target="_blank" rel="noreferrer">
            API Docs
          </a>{' '}
          · Originally by{' '}
          <a href="https://github.com/sghall/react-compound-slider" target="_blank" rel="noreferrer">
            Steve Hall
          </a>
        </p>
      </footer>
    </div>
  );
}
