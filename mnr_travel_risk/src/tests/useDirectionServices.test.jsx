import { renderHook } from "@testing-library/react";
import { useDirectionsService } from "../hooks/useDirectionsService";

describe("useDirectionsService", () => {
  let routeMock;
  let setMapMock;
  let setDirectionsMock;
  let setOptionsMock;

  beforeAll(() => {
    routeMock = jest.fn().mockResolvedValue({ status: "OK", routes: [] });
    setMapMock = jest.fn();
    setOptionsMock = jest.fn();
    setDirectionsMock = jest.fn();

    global.google = {
      maps: {
        DirectionsService: function () {
          return { route: routeMock };
        },
        DirectionsRenderer: function () {
          return {
            setMap: setMapMock,
            setDirections: setDirectionsMock,
            setOptions: setOptionsMock,
          };
        },
      },
    };
  });

  it("calls route with correct parameters", async () => {
    const { result } = renderHook(() => useDirectionsService());

    const origin = { lat: 1, lng: 1 };
    const destination = { lat: 2, lng: 2 };
    const travelMode = "DRIVING";

    await result.current.getDirections(origin, destination, travelMode);

    expect(routeMock).toHaveBeenCalledWith({
      origin,
      destination,
      travelMode,
    });
  });

  it("renders directions on the map", () => {
    const { result } = renderHook(() => useDirectionsService());

    const response = { directions: "data" };
    const map = {};

    const renderDirections = (response, map) =>
        {if(!map) return;
            const directionsRenderer = new google.maps.directionsRenderer();

        }
    ;

  });

  it("does nothing if map is null", () => {
    const { result } = renderHook(() => useDirectionsService());

    result.current.renderDirections({}, null);

    expect(setMapMock).not.toHaveBeenCalled();
    expect(setDirectionsMock).not.toHaveBeenCalled();
  });
});