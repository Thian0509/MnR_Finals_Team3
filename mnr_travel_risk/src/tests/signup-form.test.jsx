import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SignupForm } from '../components/signup-form';

// Mock the useRouter hook from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the custom UI components to prevent them from interfering with the test.

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

// Mock the signUp function from your auth-client to prevent API calls during tests.
jest.mock('@/lib/auth-client', () => ({
  signUp: {
    email: jest.fn(),
  },
}));

describe('SignupForm', () => {
  // Define a mock function for the setIsLogin prop.
  const mockSetIsLogin = jest.fn();

  // A basic test to check if the essential elements are rendered on the screen.
  test('renders all basic components and text', () => {
    render(<SignupForm setIsLogin={mockSetIsLogin} />);

    // Check for the main title and description.
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Enter your details below to create your account')).toBeInTheDocument();

    // Check for the input labels.
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

    // Check for the input fields themselves.
    expect(screen.getByRole('textbox', { name: /full name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

    // Check for the sign-up button.
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();

    // Check for the login link.
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
  });
});