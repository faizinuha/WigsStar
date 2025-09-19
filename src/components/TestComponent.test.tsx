import { render, screen } from '@testing-library/react';
import { expect } from 'vitest';
import TestComponent from './TestComponent';

describe('TestComponent', () => {
  it('renders "Hello, Vitest!"', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello, Vitest!')).toBeInTheDocument();
  });
});