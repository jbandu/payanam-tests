import { render, screen } from '@testing-library/react';
import Hello from './Hello';

test('shows greeting', () => {
  render(<Hello />);
  expect(screen.getByText('Hello, Payanam!')).toBeInTheDocument();
});

