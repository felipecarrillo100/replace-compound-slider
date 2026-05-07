import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Rail } from '../Rail';
import { GetRailProps } from '../Rail/types';
import { Handles } from '../Handles';
import { GetHandleProps } from '../Handles/types';
import { Slider } from './Slider';
import * as utils from './utils';

const getTestProps = () => ({
  step: 1,
  domain: [100, 200],
  values: [110, 150],
  reversed: false,
});

const RailComponent: React.FC<{ getRailProps: GetRailProps }> = ({
  getRailProps,
}) => <div data-testid="rail" {...getRailProps()} />;

const HandleComponent: React.FC<{
  id: string;
  getHandleProps: GetHandleProps;
}> = ({ id, getHandleProps }) => <button data-testid={`handle-${id}`} {...getHandleProps(id)} />;

describe('<Slider />', () => {
  it('renders DOM elements children when passed', () => {
    render(
      <Slider {...getTestProps()}>
        <div className="foo" data-testid="foo" />
      </Slider>
    );

    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });

  it('renders Component children when passed', () => {
    const Custom = () => <div className="foo" data-testid="custom" />;

    render(
      <Slider {...getTestProps()}>
        <Custom />
      </Slider>
    );

    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it("calls getHandles when reversed changes", () => {
    const getHandlesSpy = vi.spyOn(utils, 'getHandles');
    const { rerender } = render(<Slider {...getTestProps()} />);

    expect(getHandlesSpy).toHaveBeenCalledTimes(1);
    rerender(<Slider {...getTestProps()} reversed={true} />);
    expect(getHandlesSpy).toHaveBeenCalledTimes(2);
    getHandlesSpy.mockRestore();
  });

  it('calls getHandles when values change', () => {
    const getHandlesSpy = vi.spyOn(utils, 'getHandles');
    const { rerender } = render(<Slider {...getTestProps()} />);

    expect(getHandlesSpy).toHaveBeenCalledTimes(1);
    rerender(<Slider {...getTestProps()} values={[130, 140]} />);
    expect(getHandlesSpy).toHaveBeenCalledTimes(2);
    getHandlesSpy.mockRestore();
  });

  it('does NOT call gethandles when values change to a different array with the same values', () => {
    const getHandlesSpy = vi.spyOn(utils, 'getHandles');
    const props = getTestProps();
    const { rerender } = render(<Slider {...props} />);

    expect(getHandlesSpy).toHaveBeenCalledTimes(1);
    rerender(<Slider {...props} values={[...props.values]} />);
    expect(getHandlesSpy).toHaveBeenCalledTimes(1);
    getHandlesSpy.mockRestore();
  });

  it('does call onChange/onUpdate when it should (domain change)', () => {
    const onUpdate = vi.fn();
    const onChange = vi.fn();

    const props = {
      ...getTestProps(),
      onChange,
      onUpdate,
    };

    const { rerender } = render(<Slider {...props} />);

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    
    rerender(<Slider {...props} domain={[50, 200]} />);
    
    expect(onUpdate).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });

  it('should handle keyboard events', () => {
    const onChange = vi.fn();
    const props = {
      ...getTestProps(),
      values: [110],
      onChange,
    };

    render(
      <Slider {...props}>
        <Handles>
          {({ handles, getHandleProps }) => (
            <HandleComponent id={handles[0].id} getHandleProps={getHandleProps} />
          )}
        </Handles>
      </Slider>
    );

    const handle = screen.getByRole('button');
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith([111]);
  });

  it('should not call events when disabled', () => {
    const onUpdate = vi.fn();
    const sliderProps = {
      ...getTestProps(),
      disabled: true,
      values: [110],
      onUpdate,
    };

    render(
      <Slider {...sliderProps}>
        <Handles>
          {({ handles, getHandleProps }) => (
            <HandleComponent id={handles[0].id} getHandleProps={getHandleProps} />
          )}
        </Handles>
        <Rail>
          {({ getRailProps }) => <RailComponent getRailProps={getRailProps} />}
        </Rail>
      </Slider>
    );

    const handle = screen.getByRole('button');
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(onUpdate).not.toHaveBeenCalled();

    const rail = screen.getByTestId('rail');
    fireEvent.mouseDown(rail);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('should allow conditional rendering', () => {
    expect(() => {
      render(<Slider {...getTestProps()}>{null}{null}</Slider>);
    }).not.toThrow();
  });
});
