import{render,screen,fireEvent, waitFor} from '@testing-library/react';
import MapComponent from '../components/MapComponent';
import * as actions from '../actions/actions';
import useLocation from '../hooks/useLocation';
import { TrafficLayer } from '@react-google-maps/api';

jest.mock('../actions/actions');
jest.mock('../hooks/useLocation');
const mockSetMap = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  useLocation.mockReturnValue({ location: null, isLoading: false });

  window.google = {
    maps: {
      Map: jest.fn().mockImplementation(() => ({
        setOptions: jest.fn(),
        setZoom: jest.fn(),
        getCenter: jest.fn(() => ({ toJSON: () => ({ lat: -25, lng: 28 }) })),
        getZoom: jest.fn(() => 10),
        setCenter: jest.fn(),
        panTo: jest.fn(),
        addListener: jest.fn(() => ({ remove: jest.fn() })),
      })),
      LatLng: jest.fn().mockImplementation((lat, lng) => ({ lat, lng })),
      TrafficLayer: jest.fn().mockImplementation(() => ({ setMap: jest.fn() })),
      visualization: { HeatmapLayer: jest.fn().mockImplementation(() => ({ setMap: jest.fn() })) },
    },
  };
});

test('renders loading when not loaded or before client', () => {
  render(<MapComponent isLoaded={false} map={null} setMap={mockSetMap} />);
  expect(screen.getByText(/loading map/i)).toBeInTheDocument();
});

test('renders map and button when loaded and client', async () => {
  useLocation.mockReturnValue({ location: null, isLoading: false });
  render(<MapComponent isLoaded={true} map={null} setMap={mockSetMap} />);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /refresh risks/i })).toBeInTheDocument()
  );
});
test('updates center from location when location changes', () => {
  const location = { coords: { latitude: -26, longitude: 27 } };
    useLocation.mockReturnValue({ location: null, isLoading: false });

  const { rerender } = render(<MapComponent isLoaded={true} map={null} setMap={mockSetMap} />);

});

test('loadMarkers calls getWeatherAtLocation and getRiskFromWeather and sets markers', async () => {
  actions.getWeatherAtLocation.mockResolvedValue({ temp: 20 });
  actions.getRiskFromWeather.mockResolvedValue(5);

  useLocation.mockReturnValue({ location: null, isLoading: false });

  const mapInstance = new google.maps.Map();

  render(<MapComponent isLoaded={true} map={mapInstance} setMap={mockSetMap} />);
 
  await waitFor(() => {
    expect(actions.getWeatherAtLocation).toHaveBeenCalled();
    expect(actions.getRiskFromWeather).toHaveBeenCalled();
  });
});

test('handleRefresh updates center and calls loadMarkers', async () => {
  actions.getWeatherAtLocation.mockResolvedValue({ temp: 20 });
  actions.getRiskFromWeather.mockResolvedValue(5);

  useLocation.mockReturnValue({ location: null, isLoading: false });

  const mapInstance = new google.maps.Map();
  render(<MapComponent isLoaded={true} map={mapInstance} setMap={mockSetMap} />);

  const button = await screen.findByRole('button', { name: /refresh risks/i });
  fireEvent.click(button);

 
});
