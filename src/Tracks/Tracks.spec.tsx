import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LinearScale } from '../scales/LinearScale';
import { Tracks } from './Tracks';

const noop = () => {};

const createHandles = (count: number) => {
  const handles = [];

  for (let i = 0; i < count; i++) {
    handles.push({ id: `hid-${i}`, value: 0, percent: 0 });
  }

  return handles;
};

const getTestProps = (handleCount = 1) => ({
  scale: new LinearScale(),
  handles: createHandles(handleCount),
  emitMouse: noop,
  emitTouch: noop,
  left: true,
  right: true,
});

describe('<Tracks />', () => {
  it('renders the result of child function', () => {
    render(
      <Tracks {...getTestProps(1)}>
        {() => {
          return <div data-testid="foo" />;
        }}
      </Tracks>
    );

    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });

  it('should get handles + 1 tracks when left === true and right === true', () => {
    const handleCount = 3;

    render(
      <Tracks {...getTestProps(handleCount)}>
        {({ tracks }) => (
          <div>
            {tracks.map(({ id }) => (
              <div data-testid="track" key={id} />
            ))}
          </div>
        )}
      </Tracks>
    );

    expect(screen.getAllByTestId('track')).toHaveLength(handleCount + 1);
  });

  it('should get handles + 0 tracks when left === true and right === false', () => {
    const handleCount = 3;

    const props = {
      ...getTestProps(handleCount),
      right: false,
    };

    render(
      <Tracks {...props}>
        {({ tracks }) => (
          <div>
            {tracks.map(({ id }) => (
              <div data-testid="track" key={id} />
            ))}
          </div>
        )}
      </Tracks>
    );

    expect(screen.getAllByTestId('track')).toHaveLength(handleCount + 0);
  });

  it('should get handles - 1 tracks when left === false and right === false', () => {
    const handleCount = 3;

    const props = {
      ...getTestProps(handleCount),
      left: false,
      right: false,
    };

    render(
      <Tracks {...props}>
        {({ tracks }) => (
          <div>
            {tracks.map(({ id }) => (
              <div data-testid="track" key={id} />
            ))}
          </div>
        )}
      </Tracks>
    );

    expect(screen.getAllByTestId('track')).toHaveLength(handleCount - 1);
  });
});
