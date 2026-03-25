import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

const mockItems = [
  { id: '1', name: 'Test Item', description: 'A test description', createdAt: new Date().toISOString() },
];

// Helper: mock fetch to return items + health ok
function mockFetchSuccess() {
  global.fetch.mockImplementation((url) => {
    if (url.includes('/health')) {
      return Promise.resolve({ ok: true, json: async () => ({ status: 'ok' }) });
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ success: true, count: 1, data: mockItems }),
    });
  });
}

test('renders CloudPipeline heading', async () => {
  mockFetchSuccess();
  render(<App />);
  expect(screen.getByText('CloudPipeline')).toBeInTheDocument();
});

test('renders items after fetch', async () => {
  mockFetchSuccess();
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });
});

test('shows empty state when no items', async () => {
  global.fetch.mockImplementation(() =>
    Promise.resolve({ ok: true, json: async () => ({ success: true, count: 0, data: [] }) })
  );
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });
});

test('shows error when fetch fails', async () => {
  global.fetch.mockRejectedValue(new Error('Network error'));
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });
});

test('Add Item form renders with correct fields', () => {
  mockFetchSuccess();
  render(<App />);
  expect(screen.getByPlaceholderText(/e.g. My New Item/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Describe this item/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
});

test('shows validation errors on empty submit', async () => {
  mockFetchSuccess();
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));
  await waitFor(() => {
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });
});
