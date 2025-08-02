import { renderHook, act } from "@testing-library/react"
import { useGoogleMaps } from "../hooks/useGoogleMaps"

// Mock the @react-google-maps/api module
jest.mock("@react-google-maps/api", () => ({
  useLoadScript: jest.fn()
}))

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_MAPS_API_KEY: "test-api-key"
}

Object.defineProperty(process, "env", {
  value: mockEnv
})

//1 Test: Calls useLoadScript with correct parameters
describe("useGoogleMaps", () => {
  const mockUseLoadScript = require("@react-google-maps/api").useLoadScript
//This hook manages the loading of the external script and provides status information about its loading process (e.g., isLoaded, loadError).
// This test confirms that the setup is correct and nothing critical (like the API key) is being missed or misconfigured.
//We check that the useLoadScript hook was invoked with the googleMapsApiKey from the environment and a set of libraries the app depends on, such as places and visualization
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should call useLoadScript with correct parameters", () => {
    // Arrange
    mockUseLoadScript.mockReturnValue({
      isLoaded: false,
      loadError: undefined
    })

    // Act
    renderHook(() => useGoogleMaps())

    // Assert
    expect(mockUseLoadScript).toHaveBeenCalledWith({
      id: "google-map-script",
      googleMapsApiKey: "test-api-key",
      libraries: ["places", "visualization", "geometry", "marker"]
    })
  })

  it("should return initial state correctly", () => {
    // Arrange
    mockUseLoadScript.mockReturnValue({
      isLoaded: false,
      loadError: undefined
    })

    // Act
    const { result } = renderHook(() => useGoogleMaps())

    // Assert
    expect(result.current).toEqual({
      isLoaded: false,
      loadError: undefined,
      map: null,
      setMap: expect.any(Function)
    })
  })

  it("should return isLoaded as true when script is loaded", () => {
    // Arrange
    mockUseLoadScript.mockReturnValue({
      isLoaded: true,
      loadError: undefined
    })

    // Act
    const { result } = renderHook(() => useGoogleMaps())

    // Assert
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.loadError).toBeUndefined()
  })

  it("should return loadError when script fails to load", () => {
    // Arrange
    const mockError = new Error("Failed to load Google Maps script")
    mockUseLoadScript.mockReturnValue({
      isLoaded: false,
      loadError: mockError
    })

    // Act
    const { result } = renderHook(() => useGoogleMaps())

    // Assert
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.loadError).toBe(mockError)
  })

  it("should update map state when setMap is called", () => {
    // Arrange
    mockUseLoadScript.mockReturnValue({
      isLoaded: true,
      loadError: undefined
    })

    const mockMap = {
      setCenter: jest.fn(),
      setZoom: jest.fn()
    }

    // Act
    const { result } = renderHook(() => useGoogleMaps())

    act(() => {
      result.current.setMap(mockMap)
    })

    // Assert
    expect(result.current.map).toBe(mockMap)
  })

  it("should allow setting map to null", () => {
    // Arrange
    mockUseLoadScript.mockReturnValue({
      isLoaded: true,
      loadError: undefined
    })

    const mockMap = {
      setCenter: jest.fn(),
      setZoom: jest.fn()
    }

    // Act
    const { result } = renderHook(() => useGoogleMaps())

    // First set a map
    act(() => {
      result.current.setMap(mockMap)
    })

    expect(result.current.map).toBe(mockMap)

    // Then set it back to null
    act(() => {
      result.current.setMap(null)
    })

    // Assert
    expect(result.current.map).toBeNull()
  })

  it("should maintain stable setMap function reference", () => {
    // Arrange
    mockUseLoadScript.mockReturnValue({
      isLoaded: false,
      loadError: undefined
    })

    // Act
    const { result, rerender } = renderHook(() => useGoogleMaps())
    const firstSetMap = result.current.setMap

    rerender()
    const secondSetMap = result.current.setMap

    // Assert
    expect(firstSetMap).toBe(secondSetMap)
  })

  it("should handle missing API key gracefully", () => {
    // Arrange
    const originalEnv = process.env.NEXT_PUBLIC_MAPS_API_KEY
    delete process.env.NEXT_PUBLIC_MAPS_API_KEY

    mockUseLoadScript.mockReturnValue({
      isLoaded: false,
      loadError: undefined
    })

    // Act
    renderHook(() => useGoogleMaps())

    // Assert
    expect(mockUseLoadScript).toHaveBeenCalledWith({
      id: "google-map-script",
      googleMapsApiKey: undefined,
      libraries: ["places", "visualization", "geometry", "marker"]
    })

    // Cleanup
    process.env.NEXT_PUBLIC_MAPS_API_KEY = originalEnv
  })

  it("should work with different useLoadScript states", () => {
    // Test loading state
    mockUseLoadScript.mockReturnValue({
      isLoaded: false,
      loadError: undefined
    })

    const { result, rerender } = renderHook(() => useGoogleMaps())

    expect(result.current.isLoaded).toBe(false)
    expect(result.current.loadError).toBeUndefined()

    // Test loaded state
    mockUseLoadScript.mockReturnValue({
      isLoaded: true,
      loadError: undefined
    })

    rerender()

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.loadError).toBeUndefined()

    // Test error state
    const error = new Error("Network error")
    mockUseLoadScript.mockReturnValue({
      isLoaded: false,
      loadError: error
    })

    rerender()

    expect(result.current.isLoaded).toBe(false)
    expect(result.current.loadError).toBe(error)
  })
})
