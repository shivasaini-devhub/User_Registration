import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserListModal } from '../UserListModal';

global.fetch = vi.fn();

describe('UserListModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<UserListModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches and displays registered users list when isOpen is true', async () => {
    const mockUsers = [
      {
        id: 'u-1',
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        createdAt: new Date().toISOString(),
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    render(<UserListModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Sarah Connor/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/sarah@example.com/i)).toBeInTheDocument();
  });
});
