import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from './useClickOutside';

function setup(callback) {
  // Crear un elemento real en el DOM para usar como ref
  const container = document.createElement('div');
  const inside = document.createElement('button');
  container.appendChild(inside);
  document.body.appendChild(container);

  const ref = { current: container };
  renderHook(() => useClickOutside(ref, callback));

  return { container, inside };
}

afterEach(() => {
  document.body.innerHTML = '';
});

test('dispara el callback al hacer clic fuera del elemento', () => {
  const callback = vi.fn();
  setup(callback);

  const outside = document.createElement('div');
  document.body.appendChild(outside);
  fireEvent.mouseDown(outside);

  expect(callback).toHaveBeenCalledTimes(1);
});

test('no dispara el callback al hacer clic dentro del elemento', () => {
  const callback = vi.fn();
  const { inside } = setup(callback);

  fireEvent.mouseDown(inside);

  expect(callback).not.toHaveBeenCalled();
});

test('no dispara el callback al hacer clic en el propio elemento', () => {
  const callback = vi.fn();
  const { container } = setup(callback);

  fireEvent.mouseDown(container);

  expect(callback).not.toHaveBeenCalled();
});
