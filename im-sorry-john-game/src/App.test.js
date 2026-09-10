import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./PhaserComponents/GameHolder', () => ({
  GameHolder: () => <div data-testid="game-holder" />,
}));

test('renders the game holder', () => {
  render(<App />);
  expect(screen.getByTestId('game-holder')).toBeInTheDocument();
});
