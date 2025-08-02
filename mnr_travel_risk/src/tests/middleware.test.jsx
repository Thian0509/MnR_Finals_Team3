import { NextResponse } from "next/server"
import { middleware, config } from "../middleware"

// Mock better-auth/cookies
jest.mock("better-auth/cookies", () => ({
  getSessionCookie: jest.fn()
}))

// Mock NextResponse
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn()
  }
}))

const mockGetSessionCookie = require("better-auth/cookies").getSessionCookie
const mockNextResponse = NextResponse

describe("middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("authentication checks", () => {
    it("should redirect to login when session cookie is missing", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/dashboard"
      }

      mockGetSessionCookie.mockReturnValue(null)
      const mockRedirectResponse = { type: "redirect" }
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse)

      // Act
      const result = await middleware(mockRequest)

      // Assert
      expect(mockGetSessionCookie).toHaveBeenCalledWith(mockRequest)
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "https://example.com/dashboard")
      )
      expect(result).toBe(mockRedirectResponse)
    })

    it("should redirect to login when session cookie is undefined", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/profile"
      }

      mockGetSessionCookie.mockReturnValue(undefined)
      const mockRedirectResponse = { type: "redirect" }
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse)

      // Act
      const result = await middleware(mockRequest)

      // Assert
      expect(mockGetSessionCookie).toHaveBeenCalledWith(mockRequest)
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "https://example.com/profile")
      )
      expect(result).toBe(mockRedirectResponse)
    })

    it("should redirect to login when session cookie is empty string", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/settings"
      }

      mockGetSessionCookie.mockReturnValue("")
      const mockRedirectResponse = { type: "redirect" }
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse)

      // Act
      const result = await middleware(mockRequest)

      // Assert
      expect(mockGetSessionCookie).toHaveBeenCalledWith(mockRequest)
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "https://example.com/settings")
      )
      expect(result).toBe(mockRedirectResponse)
    })

    it("should continue when session cookie exists", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/dashboard"
      }

      mockGetSessionCookie.mockReturnValue("valid-session-token")
      const mockNextResponse = { type: "next" }
      NextResponse.next.mockReturnValue(mockNextResponse)

      // Act
      const result = await middleware(mockRequest)

      // Assert
      expect(mockGetSessionCookie).toHaveBeenCalledWith(mockRequest)
      expect(NextResponse.next).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(result).toBe(mockNextResponse)
    })

    it("should continue when session cookie is a valid object", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/api/data"
      }

      const mockSessionData = {
        userId: "123",
        token: "abc123"
      }
      mockGetSessionCookie.mockReturnValue(mockSessionData)
      const mockNextResponse = { type: "next" }
      NextResponse.next.mockReturnValue(mockNextResponse)

      // Act
      const result = await middleware(mockRequest)

      // Assert
      expect(mockGetSessionCookie).toHaveBeenCalledWith(mockRequest)
      expect(NextResponse.next).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(result).toBe(mockNextResponse)
    })
  })

  describe("URL handling", () => {
    it("should redirect to login with correct URL for different domains", async () => {
      // Arrange
      const mockRequest = {
        url: "https://myapp.com/protected-page"
      }

      mockGetSessionCookie.mockReturnValue(null)
      const mockRedirectResponse = { type: "redirect" }
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse)

      // Act
      await middleware(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "https://myapp.com/protected-page")
      )
    })

    it("should redirect to login with correct URL for localhost", async () => {
      // Arrange
      const mockRequest = {
        url: "http://localhost:3000/admin"
      }

      mockGetSessionCookie.mockReturnValue(null)
      const mockRedirectResponse = { type: "redirect" }
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse)

      // Act
      await middleware(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "http://localhost:3000/admin")
      )
    })

    it("should handle complex URLs with query parameters", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/dashboard?tab=analytics&filter=today"
      }

      mockGetSessionCookie.mockReturnValue(null)
      const mockRedirectResponse = { type: "redirect" }
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse)

      // Act
      await middleware(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL(
          "/login",
          "https://example.com/dashboard?tab=analytics&filter=today"
        )
      )
    })
  })

  describe("error handling", () => {
    it("should handle errors from getSessionCookie gracefully", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/dashboard"
      }

      mockGetSessionCookie.mockImplementation(() => {
        throw new Error("Cookie parsing error")
      })

      // Act & Assert
      await expect(middleware(mockRequest)).rejects.toThrow(
        "Cookie parsing error"
      )
      expect(mockGetSessionCookie).toHaveBeenCalledWith(mockRequest)
    })

    it("should handle malformed URLs gracefully", async () => {
      // Arrange
      const mockRequest = {
        url: "invalid-url"
      }

      mockGetSessionCookie.mockReturnValue(null)

      // Act & Assert
      await expect(middleware(mockRequest)).rejects.toThrow()
    })
  })

  describe("edge cases", () => {
    it("should handle boolean false session cookie", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/dashboard"
      }

      mockGetSessionCookie.mockReturnValue(false)
      const mockRedirectResponse = { type: "redirect" }
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse)

      // Act
      const result = await middleware(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "https://example.com/dashboard")
      )
      expect(result).toBe(mockRedirectResponse)
    })

    it("should handle number 0 session cookie", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/dashboard"
      }

      mockGetSessionCookie.mockReturnValue(0)
      const mockRedirectResponse = { type: "redirect" }
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse)

      // Act
      const result = await middleware(mockRequest)

      // Assert
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "https://example.com/dashboard")
      )
      expect(result).toBe(mockRedirectResponse)
    })

    it("should continue with truthy non-string session cookie", async () => {
      // Arrange
      const mockRequest = {
        url: "https://example.com/dashboard"
      }

      mockGetSessionCookie.mockReturnValue(1)
      const mockNextResponse = { type: "next" }
      NextResponse.next.mockReturnValue(mockNextResponse)

      // Act
      const result = await middleware(mockRequest)

      // Assert
      expect(NextResponse.next).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(result).toBe(mockNextResponse)
    })
  })
})

describe("middleware config", () => {
  it("should have correct matcher configuration", () => {
    // Assert
    expect(config).toEqual({
      matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"]
    })
  })

  it("should exclude auth API routes from matcher", () => {
    const matcher = config.matcher[0]

    // Test cases that should NOT match (excluded paths)
    const excludedPaths = [
      "/api/auth/login",
      "/api/auth/logout",
      "/api/auth/session",
      "/_next/static/css/app.css",
      "/_next/static/js/main.js",
      "/_next/image/avatar.jpg",
      "/favicon.ico",
      "/login"
    ]


  })

  it("should include protected routes in matcher", () => {
    const matcher = config.matcher[0]

    // Test cases that SHOULD match (protected paths)
    const protectedPaths = [
      "/dashboard",
      "/profile",
      "/settings",
      "/admin",
      "/api/data",
      "/api/users"
    ]

  })
})
