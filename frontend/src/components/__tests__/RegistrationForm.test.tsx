import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationForm } from '../RegistrationForm';

// Global fetch mock
global.fetch = vi.fn();

describe('RegistrationForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input fields and submit button', () => {
    render(<RegistrationForm />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register Account/i })).toBeInTheDocument();
  });

  it('shows validation error messages when submitting empty form', async () => {
    render(<RegistrationForm />);

    const submitBtn = screen.getByRole('button', { name: /Register Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Full name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Email address is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
  });

  it('shows error when confirm password does not match password', async () => {
    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'mismatch123' } });

    const submitBtn = screen.getByRole('button', { name: /Register Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('submits valid form data and displays success view', async () => {
    const mockUserResponse = {
      user: {
        id: 'user-uuid-101',
        name: 'Alex Morgan',
        email: 'alex@example.com',
        createdAt: new Date().toISOString(),
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserResponse,
    });

    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'secret123' } });

    const submitBtn = screen.getByRole('button', { name: /Register Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Registration Successful!/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Alex Morgan/i)).toBeInTheDocument();
    expect(screen.getByText(/alex@example.com/i)).toBeInTheDocument();
  });

  it('displays error banner when backend returns error message', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'An account with this email address already exists.' }),
    });

    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'secret123' } });

    const submitBtn = screen.getByRole('button', { name: /Register Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/An account with this email address already exists./i)).toBeInTheDocument();
    });
  });
});
