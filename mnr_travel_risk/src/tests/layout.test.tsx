import React from "react";
import { render, screen } from "@testing-library/react";
import RootLayout from "../app/layout"; // adjust the path if needed

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock your custom session hook
jest.mock("@/lib/auth-client", () => ({
  useSession: jest.fn(() => ({
    data: { user: { name: "Test User" } },
    isPending: false,
  })),
}));

describe("RootLayout", () => {
  it("renders children correctly", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});


//initial state + effects

//button click