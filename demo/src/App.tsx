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
const DOMAIN_97: [number, number] = [0, 97];
const DOMAIN_1000: [number, number] = [1, 1000];

// Date helpers
const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const START_DATE = new Date(2026, 4, 10).getTime(); // May 10, 2026
const END_DATE = START_DATE + (7 * ONE_DAY);
const DATE_DOMAIN: [number, number] = [START_DATE, END_DATE];

const formatDateTime = (ms: number) => {
  const date = new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${date}\n${time}`;
};

const formatChipDateTime = (ms: number) => {
  return new Date(ms).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
};

const logScale = (value: number) => {
  const minPos = 0;
  const maxPos = 100;
  const minVal = Math.log(1);
  const maxVal = Math.log(10000);
  const scale = (maxVal - minVal) / (maxPos - minPos);
  return Math.exp(minVal + scale * (value - minPos));
};

// ─── Reusable Card Component ──────────────────────────────────
interface CardProps {
  title: string;
  description: string;
  hint: string;
  values: { label?: string; value: number | string; active?: boolean }[];
  snippet: string;
  children: React.ReactNode;
  badge?: string;
}

const Card: React.FC<CardProps> = ({ title, description, hint, values, snippet, children, badge }) => (
  <section className="demo-card">
    <div className="card-header">
      <h3 className="card-title">{title}</h3>
      {badge && <span className="card-badge">{badge}</span>}
    </div>
    <p className="card-description">{description}</p>
    <div className="card-theory"><strong>Hint:</strong> {hint}</div>
    <div className="value-display">
      {values.map((v, i) => (
        <span key={i} className={`value-chip${v.active !== false ? ' active' : ''}`}>
          {v.label ? `${v.label}: ` : `H${i + 1}: `}{v.value}
        </span>
      ))}
    </div>
    <div className="slider-container">
      {children}
    </div>
    <pre className="code-block">{snippet.trim()}</pre>
  </section>
);

const SectionHeader: React.FC<{ title: string, level: string, num: number }> = ({ title, level, num }) => (
  <div className="section-heading">
    <span className={`section-level level-${num}`}>{level}</span>
    <h2>{title}</h2>
  </div>
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

  // ── Example states ──────────────────────────────────────────────
  const [single, setSingle] = useState([40]);
  const [range, setRange] = useState([20, 70]);
  const [multi, setMulti] = useState([10, 30, 50, 70, 90]);
  const [vertical, setVertical] = useState([30, 65]);
  const [steps, setSteps] = useState([2.5]);
  const [largeDomain, setLargeDomain] = useState([500]);
  
  const [liveValue, setLiveValue] = useState([40]);
  const [committedValue, setCommittedValue] = useState([40]);
  const [isDragging, setIsDragging] = useState(false);

  const [niceTicked, setNiceTicked] = useState([20, 80]);
  const [pushable, setPushable] = useState([15, 45, 75]);
  
  const [temp, setTemp] = useState([22]);
  const [dates, setDates] = useState([START_DATE + (2 * ONE_DAY), START_DATE + (5 * ONE_DAY)]);
  const [logValue, setLogValue] = useState([50]);
  const [shifterValue, setShifterValue] = useState([40, 60]);
  const [shifterSkin, setShifterSkin] = useState<'default' | 'ios' | 'cyberpunk' | 'material' | 'bootstrap'>('default');
  const [mobileValue, setMobileValue] = useState([50]);

  return (
    <div className="demo-wrapper">
      <header className="demo-header">
        <div className="demo-header-left">
          <h1 className="demo-title"><span>replace-compound-slider</span></h1>
          <p className="demo-subtitle">A headless, zero-dependency React slider engine.</p>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <main className="demo-gallery">
        
        {/* LEVEL 1: THE BASICS */}
        <SectionHeader title="The Basics" level="Level 1" num={1} />

        <Card 
          title="Single Value" 
          description="One handle, one value." 
          hint="Pass a single-element array to 'values'. Use Tracks with 'right={false}' to highlight the left bar."
          values={[{ value: single[0] }]}
          snippet={`const [values, setValues] = useState([40]);\n\n<Slider \n  domain={[0, 100]} \n  values={values} \n  step={1} \n  onChange={setValues}\n>\n  <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => <Handle key={h.id} handle={h} getHandleProps={getHandleProps} />)}</>\n  )}</Handles>\n  <Tracks right={false}>{({ tracks, getTrackProps }) => (\n    <>{tracks.map(t => <Track key={t.id} source={t.source} target={t.target} getTrackProps={getTrackProps} />)}</>\n  )}</Tracks>\n</Slider>`}
        >
          <Slider domain={DOMAIN_100} values={single} step={1} onChange={v => setSingle([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles>
            <Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
          </Slider>
        </Card>

        <Card 
          title="Range Selection" 
          description="Two handles that cannot cross." 
          hint="Set 'mode={2}' to prevent crossing. Use Tracks with 'left={false}' and 'right={false}' for inner segments."
          values={range.map((v, i) => ({ label: `Limit ${i + 1}`, value: v }))}
          snippet={`const [range, setRange] = useState([20, 70]);\n\n<Slider \n  domain={[0, 100]} \n  values={range} \n  mode={2} \n  onChange={setRange}\n>\n  <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => <Handle key={h.id} handle={h} getHandleProps={getHandleProps} />)}</>\n  )}</Handles>\n  <Tracks left={false} right={false}>{({ tracks, getTrackProps }) => (\n    <>{tracks.map(t => <Track key={t.id} source={t.source} target={t.target} getTrackProps={getTrackProps} />)}</>\n  )}</Tracks>\n</Slider>`}
        >
          <Slider domain={DOMAIN_100} values={range} step={1} mode={2} onChange={v => setRange([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles>
            <Tracks left={false} right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
          </Slider>
        </Card>

        <Card 
          title="Live Updates vs. Change" 
          description="Continuous feedback vs. final release commit." 
          hint="Use 'onUpdate' for real-time previews and 'onChange' for final data commits."
          badge="Core Concept"
          values={[
            { label: 'Live', value: liveValue[0], active: isDragging },
            { label: 'Committed', value: committedValue[0], active: !isDragging }
          ]}
          snippet={`const [vals, setVals] = useState([40]);\nconst [live, setLive] = useState([40]);\n\n<Slider \n  values={vals}\n  onUpdate={setLive}   // Real-time drag updates\n  onChange={setVals}   // Final release commit\n>\n  <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => <Handle key={h.id} handle={h} getHandleProps={getHandleProps} />)}</>\n  )}</Handles>\n  <Tracks right={false}>{({ tracks, getTrackProps }) => (\n    <>{tracks.map(t => <Track key={t.id} source={t.source} target={t.target} getTrackProps={getTrackProps} />)}</>\n  )}</Tracks>\n</Slider>`}
        >
          <Slider domain={DOMAIN_100} values={committedValue} step={1} onUpdate={v => { setLiveValue([...v]); setIsDragging(true); }} onChange={v => { setCommittedValue([...v]); setLiveValue([...v]); setIsDragging(false); }} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles>
            <Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
          </Slider>
        </Card>

        <Card 
          title="Multi-Handle (5 Points)" 
          description="Managing a complex list of values." 
          hint="The library can handle any number of handles. Simply pass a larger array to 'values'."
          badge="Performance"
          values={multi.map((v, i) => ({ value: v }))}
          snippet={`const [points, setPoints] = useState([10, 30, 50, 70, 90]);\n\n<Slider \n  domain={[0, 100]} \n  values={points}\n  onChange={setPoints}\n>\n  <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => <Handle key={h.id} handle={h} getHandleProps={getHandleProps} />)}</>\n  )}</Handles>\n  <Tracks left={false} right={false}>{({ tracks, getTrackProps }) => (\n    <>{tracks.map(t => <Track key={t.id} source={t.source} target={t.target} getTrackProps={getTrackProps} />)}</>\n  )}</Tracks>\n</Slider>`}
        >
          <Slider domain={DOMAIN_100} values={multi} step={1} mode={2} onChange={v => setMulti([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles>
            <Tracks left={false} right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
          </Slider>
        </Card>

        {/* LEVEL 2: INTERACTION LOGIC */}
        <SectionHeader title="Interaction Logic" level="Level 2" num={2} />

        <Card 
          title="Vertical Orientation" 
          description="Space-saving vertical layout." 
          hint="Apply 'vertical' prop to Slider and all sub-components. Set a height on the parent container."
          values={vertical.map((v, i) => ({ label: `Point ${i + 1}`, value: v }))}
          snippet={`const [points, setPoints] = useState([30, 65]);\n\n<Slider \n  vertical \n  domain={[0, 100]} \n  values={points}\n  onChange={setPoints}\n>\n  <Rail>{({ getRailProps }) => <SliderRail vertical getRailProps={getRailProps} />}</Rail>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => <Handle key={h.id} vertical handle={h} getHandleProps={getHandleProps} />)}</>\n  )}</Handles>\n</Slider>`}
        >
          <div style={{ height: 200 }}>
            <Slider vertical domain={DOMAIN_100} values={vertical} step={1} onChange={v => setVertical([...v])} rootStyle={{ position: 'relative', height: '100%', width: 40, margin: '0 auto' }}>
              <Rail>{({ getRailProps }) => <SliderRail vertical getRailProps={getRailProps} />}</Rail>
              <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} vertical domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles>
              <Tracks left={false} right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} vertical getTrackProps={getTrackProps} />)}</>}</Tracks>
            </Slider>
          </div>
        </Card>

        <Card 
          title="Precision Steps" 
          description="High-resolution fractional steps." 
          hint="Set 'step' to a decimal (e.g., 0.1). Ideal for scientific or fine-tuning inputs."
          values={[{ value: steps[0] }]}
          snippet={`const [steps, setSteps] = useState([2.5]);\n\n<Slider \n  domain={[0, 10]} \n  step={0.1} \n  values={steps}\n  onChange={setSteps}\n>\n  <Rail>...</Rail>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => <Handle key={h.id} format={v => Number(v).toFixed(2)} {...getHandleProps(h.id)} />)}</>\n  )}</Handles>\n</Slider>`}
        >
          <Slider domain={[0, 10]} values={steps} step={0.1} onChange={v => setSteps([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={[0, 10]} getHandleProps={getHandleProps} format={v => Number(v).toFixed(2)} />)}</>}</Handles>
          </Slider>
        </Card>

        <Card 
          title="Large Domain" 
          description="Handling wide ranges (1 to 1,000)." 
          hint="Math remains precise and performance stays high even with thousands of steps."
          values={[{ value: largeDomain[0] }]}
          snippet={`const [vals, setVals] = useState([500]);\n\n<Slider \n  domain={[1, 1000]} \n  step={1} \n  values={vals}\n  onChange={setVals}\n>\n  <Rail>...</Rail>\n  <Handles>...</Handles>\n</Slider>`}
        >
          <Slider domain={DOMAIN_1000} values={largeDomain} step={1} onChange={v => setLargeDomain([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_1000} getHandleProps={getHandleProps} />)}</>}</Handles>
            <Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
          </Slider>
        </Card>

        {/* LEVEL 3: EXPERT COMPOSITION */}
        <SectionHeader title="Expert Composition" level="Level 3" num={3} />

        <Card 
          title="Nice Ticks Algorithm" 
          description="Friendly labels for messy domains." 
          hint="Automatically snaps ticks to clean increments (0, 20, 40...) for domains like 0–97."
          values={niceTicked.map((v, i) => ({ value: v }))}
          snippet={`<Ticks count={5}>\n  {({ ticks }) => (\n    <>{ticks.map(t => <Tick key={t.id} tick={t} />)}</>\n  )}\n</Ticks>`}
        >
          <Slider domain={DOMAIN_97} values={niceTicked} step={1} onChange={v => setNiceTicked([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_97} getHandleProps={getHandleProps} />)}</>}</Handles>
            <Ticks count={5}>{({ ticks }) => <>{ticks.map(tick => <Tick key={tick.id} tick={tick} />)}</>}</Ticks>
          </Slider>
        </Card>

        <Card 
          title="The Train Effect" 
          description="Handles that push their neighbors." 
          hint="Set 'mode={3}'. Dragging one handle pushes the others while maintaining the minimum gap."
          values={pushable.map((v, i) => ({ label: `H${i + 1}`, value: v }))}
          snippet={`const [train, setTrain] = useState([15, 45, 75]);\n\n<Slider \n  domain={[0, 100]} \n  values={train} \n  mode={3}\n  onChange={setTrain}\n>\n  <Rail>...</Rail>\n  <Handles>...</Handles>\n  <Tracks left={false} right={false}>...</Tracks>\n</Slider>`}
        >
          <Slider domain={DOMAIN_100} values={pushable} step={1} mode={3} onChange={v => setPushable([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles>
            <Tracks left={false} right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
          </Slider>
        </Card>

        <Card 
          title="Vertical Temperature" 
          description="A non-standard domain [-20 to 50]." 
          hint="Ideal for climate controls. Use a vertical layout to save horizontal space."
          values={[{ label: 'Temp', value: `${temp[0]}°C` }]}
          snippet={`const [temp, setTemp] = useState([22]);\n\n<Slider \n  vertical \n  domain={[-20, 50]} \n  values={temp} \n  onChange={setTemp}\n>\n  <Rail>...</Rail>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => <Handle key={h.id} format={v => \`\${v}°C\`} {...getHandleProps(h.id)} />)}</>\n  )}</Handles>\n</Slider>`}
        >
          <div style={{ height: 200 }}>
            <Slider vertical domain={[-20, 50]} values={temp} step={1} onChange={v => setTemp([...v])} rootStyle={{ position: 'relative', height: '100%', width: 40, margin: '0 auto' }}>
              <Rail>{({ getRailProps }) => <SliderRail vertical getRailProps={getRailProps} />}</Rail>
              <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} vertical domain={[-20, 50]} getHandleProps={getHandleProps} format={v => `${v}°C`} />)}</>}</Handles>
              <Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} vertical getTrackProps={getTrackProps} />)}</>}</Tracks>
            </Slider>
          </div>
        </Card>

        <Card 
          title="Date-Time Range" 
          description="Selecting a window of time." 
          hint="Map Unix timestamps to the domain. Use a formatter for both Date and Time."
          values={dates.map((d, i) => ({ label: i === 0 ? 'Start' : 'End', value: formatChipDateTime(d) }))}
          snippet={`const [dates, setDates] = useState([start, end]);\n\n<Slider \n  domain={[min, max]} \n  values={dates} \n  step={3600000} // 1 hour steps\n  onChange={setDates}\n>\n  <Rail>...</Rail>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => (\n      <Handle \n        key={h.id} \n        format={ms => { \n          const d = formatDate(ms);\n          const t = formatTime(ms);\n          return \`\${d}\\n\${t}\`; \n        }} \n        {...getHandleProps(h.id)} \n      />\n    ))}</>\n  )}</Handles>\n</Slider>`}
        >
          <Slider domain={DATE_DOMAIN} values={dates} step={ONE_HOUR} mode={2} onChange={v => setDates([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DATE_DOMAIN} getHandleProps={getHandleProps} format={ms => formatDateTime(Number(ms))} />)}</>}</Handles>
            <Tracks left={false} right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
          </Slider>
        </Card>

        <Card 
          title="Logarithmic Mapping" 
          description="Log scale for wide range control." 
          hint="Map 0-100 to log scale. Format Handle tooltip to sync with the mapped value."
          values={[{ label: 'Mapped', value: Math.round(logScale(logValue[0])) }]}
          snippet={`const [raw, setRaw] = useState([50]);\n\n<Slider onChange={setRaw} values={raw}>\n  <Handles>{({ handles, getHandleProps }) => (\n    <>{handles.map(h => (\n       <Handle \n         key={h.id} \n         format={v => Math.round(logScale(v))} \n         {...getHandleProps(h.id)} \n       />\n    ))}</>\n  )}</Handles>\n</Slider>`}
        >
          <Slider domain={DOMAIN_100} values={logValue} step={1} onChange={v => setLogValue([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
            <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
            <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} format={v => Math.round(logScale(v)).toString()} />)}</>}</Handles>
          </Slider>
        </Card>

        {/* LEVEL 4: STYLING GALLERY */}
        <SectionHeader title="Styling Gallery" level="Level 4" num={4} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          <Card 
            title="Mobile Optimized" 
            description="Best-in-class mobile experience." 
            hint="Uses 44px touch targets, scaling handles, and large tooltips." 
            badge="Mobile First"
            values={[{ value: mobileValue[0] }]} 
            snippet={`.skin-mobile .handle-wrapper {\n  width: 44px; height: 44px;\n}\n.skin-mobile .handle-wrapper:active .handle-dot {\n  transform: scale(1.2);\n}`}
          >
            <div className="skin-mobile">
              <Slider domain={DOMAIN_100} values={mobileValue} onChange={v => setMobileValue([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
                <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
                <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles>
                <Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
              </Slider>
            </div>
          </Card>

          <Card title="iOS Minimal" description="Soft shadows and thin rails." hint="2px rails and 28px white handles." values={[{ value: 50 }]} snippet={`.skin-ios .handle-dot {\n  width: 28px; height: 28px; background: #fff;\n  box-shadow: 0 3px 8px rgba(0,0,0,0.15);\n}`}>
            <div className="skin-ios"><Slider domain={DOMAIN_100} values={[50]} rootStyle={{ position: 'relative', width: '100%', height: 40 }}><Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail><Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles><Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks></Slider></div>
          </Card>
          <Card title="Cyberpunk 2077" description="Neon glows and gradients." hint="High-contrast gradients and neon box-shadows." values={[{ value: 75 }]} snippet={`.skin-cyberpunk .track {\n  background: linear-gradient(90deg, #ff00ff, #00f2ff);\n  box-shadow: 0 0 15px rgba(255,0,255,0.5);\n}`}>
            <div className="skin-cyberpunk"><Slider domain={DOMAIN_100} values={[75]} rootStyle={{ position: 'relative', width: '100%', height: 40 }}><Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail><Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles><Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks></Slider></div>
          </Card>
          <Card title="Material Design" description="Ink-ripple hover effects." hint="Use pseudo-elements to simulate the Material ripple." values={[{ value: 30 }]} snippet={`.skin-material .handle-wrapper:active::after {\n  opacity: 0.2; transform: scale(1.2);\n}`}>
            <div className="skin-material"><Slider domain={DOMAIN_100} values={[30]} rootStyle={{ position: 'relative', width: '100%', height: 40 }}><Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail><Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles><Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks></Slider></div>
          </Card>
          <Card title="Bootstrap v5" description="Framework utility integration." hint="Integrate seamlessly using standard framework classes." values={[{ value: 85 }]} snippet={`// Wrap the Slider in a themed container\nconst [val, setVal] = useState([85]);\n\n<div className="skin-bootstrap">\n  <Slider values={val} onChange={setVal}>\n    <Rail>...</Rail>\n    <Handles>...</Handles>\n  </Slider>\n</div>`}>
            <div className="skin-bootstrap"><Slider domain={DOMAIN_100} values={[85]} rootStyle={{ position: 'relative', width: '100%', height: 40 }}><Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail><Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles><Tracks right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks></Slider></div>
          </Card>
        </div>

        {/* LEVEL 5: THE GRAND FINALE */}
        <SectionHeader title="The Grand Finale" level="Level 5" num={5} />

        <section className="demo-card" id="shape-shifter">
          <div className="card-header">
            <h3 className="card-title">The Shape Shifter</h3>
            <span className="card-badge">Master Theme</span>
          </div>
          <p className="card-description">One slider. Infinite designs. Switch themes instantly.</p>
          <div className="card-theory"><strong>Hint:</strong> Toggle the parent container class to morph the UI. Proof of headless flexibility.</div>
          <div className="value-display">
            {shifterValue.map((v, i) => (
              <span key={i} className="value-chip active">Handle {i + 1}: {v}</span>
            ))}
          </div>
          <div className="skin-shifter-controls">
            {(['default', 'ios', 'cyberpunk', 'material', 'bootstrap'] as const).map(s => (
              <button key={s} className={`skin-btn${shifterSkin === s ? ' active' : ''}`} onClick={() => setShifterSkin(s)}>{s.toUpperCase()}</button>
            ))}
          </div>
          <div className={`slider-container skin-${shifterSkin}`}>
            <Slider domain={DOMAIN_100} values={shifterValue} mode={2} onChange={v => setShifterValue([...v])} rootStyle={{ position: 'relative', width: '100%', height: 40 }}>
              <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
              <Handles>{({ handles, getHandleProps }) => <>{handles.map(h => <Handle key={h.id} handle={h} domain={DOMAIN_100} getHandleProps={getHandleProps} />)}</>}</Handles>
              <Tracks left={false} right={false}>{({ tracks, getTrackProps }) => <>{tracks.map(({ id, source, target }) => <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />)}</>}</Tracks>
              <Ticks count={5}>{({ ticks }) => <>{ticks.map(tick => <Tick key={tick.id} tick={tick} />)}</>}</Ticks>
            </Slider>
          </div>
          <pre className="code-block">{`// Dynamic theme switching\nconst [vals, setVals] = useState([40, 60]);\n\n<div className={currentSkin}>\n  <Slider \n    values={vals} \n    onChange={setVals}\n  >\n    <Rail>...</Rail>\n    <Handles>...</Handles>\n  </Slider>\n</div>`.trim()}</pre>
        </section>

      </main>

      <footer className="demo-footer">
        <p>Built with <a href="https://github.com/felipecarrillo100/replace-compound-slider" target="_blank" rel="noreferrer">replace-compound-slider</a></p>
      </footer>
    </div>
  );
}
