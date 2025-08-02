import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from '../components/login-form';

// Mock the useRouter hook from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the custom UI components to prevent them from interfering with the test.
// We'll replace them with simple div or button elements.
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

// Mock the signIn function from your auth-client to prevent API calls during tests.
jest.mock('@/lib/auth-client', () => ({
  signIn: {
    email: jest.fn(),
  },
}));

describe('LoginForm', () => {
  // Define a mock function for the setIsLogin prop.
  const mockSetIsLogin = jest.fn();

  // A basic test to check if the essential elements are rendered on the screen.
  test('renders all basic components and text', () => {
    render(<LoginForm setIsLogin={mockSetIsLogin} />);

    // Check for the main title and description.
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
    expect(screen.getByText('Enter your email below to login to your account')).toBeInTheDocument();

    // Check for the input labels.
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    // Check for the input fields themselves.
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    // Check for the login button.
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();

    // Check for the sign-up link.
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
  });
});
