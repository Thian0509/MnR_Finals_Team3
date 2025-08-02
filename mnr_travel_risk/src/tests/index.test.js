import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from '../components/login-form';


const { practiceTest } = require("./index");
describe("Test for initial Jest setup.", () => { //main test suite containing all tests
  describe("practiceTest", () => {
    test("Given 'Hello World!', return 'Hello World!'", () => {
      const received = "Hello World!";
      const expected = "Hello World!";
      expect(practiceTest(received)).toBe(expected);
    });
  });

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

});