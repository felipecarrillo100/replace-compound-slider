import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Rail } from './Rail';

const noop = () => ({ value: 0, percent: 0 });

describe('<Rail />', () => {
  it('renders the result of child function', () => {
    render(
      <Rail emitMouse={() => {}} emitTouch={() => {}} getEventData={noop}>
        {() => {
          return <div data-testid="foo" />;
        }}
      </Rail>
    );

    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });
});
