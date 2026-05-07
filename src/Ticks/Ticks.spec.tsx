import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Ticks } from './Ticks';

describe('<Ticks />', () => {
  it('renders the result of child function', () => {
    render(
      <Ticks>
        {() => {
          return <div data-testid="foo" />;
        }}
      </Ticks>
    );

    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });
});
