import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Handles } from './Handles';

const noop = () => {};

describe('<Handles />', () => {
  it('renders the result of child function', () => {
    render(
      <Handles handles={[]} emitMouse={noop} emitTouch={noop} emitKeyboard={noop}>
        {() => {
          return <div data-testid="foo" />;
        }}
      </Handles>
    );

    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });
});
