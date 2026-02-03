import { useRef, useEffect, useState, useCallback } from 'react';

export interface MapboxGL {
  Map: new (options: MapboxMapOptions) => MapboxMap;
  Marker: new (options?: MapboxMarkerOptions) => MapboxMarker;
  Popup: new (options?: MapboxPopupOptions) => MapboxPopup;
  accessToken: string;
}

export interface MapboxMapOptions {
  container: HTMLElement | string;
  style: string;
  center: [number, number];
  zoom: number;
}

export interface MapboxMap {
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
  flyTo: (options: { center: [number, number]; zoom: number }) => void;
  remove: () => void;
  resize: () => void;
}

export interface MapboxMarkerOptions {
  color?: string;
}

export interface MapboxMarker {
  setLngLat: (lngLat: [number, number]) => MapboxMarker;
  setPopup: (popup: MapboxPopup) => MapboxMarker;
  addTo: (map: MapboxMap) => MapboxMarker;
  remove: () => void;
}

export interface MapboxPopupOptions {
  closeOnClick?: boolean;
  closeButton?: boolean;
}

export interface MapboxPopup {
  setLngLat: (lngLat: [number, number]) => MapboxPopup;
  setHTML: (html: string) => MapboxPopup;
  addTo: (map: MapboxMap) => MapboxPopup;
  remove: () => void;
}

export interface Organization {
  organizationName: string;
  mission: string;
  website: string;
  contactEmail: string;
  headquartersAddress: string;
  street: string;
  city: string;
  stateProvince: string;
  country: string;
  zipPostalCode: string;
  siteLatitude: number;
  siteLongitude: number;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedOrganization: Organization | null;
}

export interface UseMapboxReturn {
  mapContainer: React.RefObject<HTMLDivElement>;
  map: MapboxMap | null;
  isLoaded: boolean;
  error: string | null;
  addMarkers: (organizations: Organization[]) => void;
  clearMarkers: () => void;
  flyToLocation: (lng: number, lat: number, zoom?: number) => void;
  setSelectedOrganization: (organization: Organization | null) => void;
  selectedOrganization: Organization | null;
}

export const useMapbox = (
  accessToken: string,
  initialState: MapState = {
    center: [0, 0],
    zoom: 2,
    selectedOrganization: null
  }
): UseMapboxReturn => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<MapboxMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(
    initialState.selectedOrganization
  );

  const loadMapboxGL = useCallback(async (): Promise<MapboxGL | null> => {
    try {
      const mapboxgl = await import('mapbox-gl');
      return mapboxgl.default as unknown as MapboxGL;
    } catch (err) {
      setError('Failed to load Mapbox GL JS');
      return null;
    }
  }, []);

  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || map.current) return;

    const mapboxgl = await loadMapboxGL();
    if (!mapboxgl) return;

    try {
      mapboxgl.accessToken = accessToken;
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: initialState.center,
        zoom: initialState.zoom
      });

      mapInstance.on('load', () => {
        setIsLoaded(true);
        setError(null);
      });

      map.current = mapInstance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }
  }, [accessToken, initialState, loadMapboxGL]);

  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  }, []);

  const addMarkers = useCallback(async (organizations: Organization[]) => {
    if (!map.current) return;

    const mapboxgl = await loadMapboxGL();
    if (!mapboxgl) return;

    clearMarkers();

    organizations.forEach(org => {
      if (org.siteLongitude && org.siteLatitude) {
        const popup = new mapboxgl.Popup({
          closeOnClick: false,
          closeButton: true
        }).setHTML(`
          <div class="p-4 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${org.organizationName}</h3>
            <p class="text-sm text-gray-600 mb-2">${org.mission}</p>
            <div class="space-y-1 text-xs">
              <p><strong>Location:</strong> ${org.city}, ${org.country}</p>
              ${org.website ? `<p><strong>Website:</strong> <a href="${org.website}" target="_blank" class="text-blue-600 hover:underline">${org.website}</a></p>` : ''}
              ${org.contactEmail ? `<p><strong>Email:</strong> <a href="mailto:${org.contactEmail}" class="text-blue-600 hover:underline">${org.contactEmail}</a></p>` : ''}
            </div>
          </div>
        `);

        const marker = new mapboxgl.Marker({
          color: '#0ea5e9'
        })
          .setLngLat([org.siteLongitude, org.siteLatitude])
          .setPopup(popup)
          .addTo(map.current!);

        markers.current.push(marker);
      }
    });
  }, [clearMarkers, loadMapboxGL]);

  const flyToLocation = useCallback((lng: number, lat: number, zoom: number = 10) => {
    if (!map.current) return;

    map.current.flyTo({
      center: [lng, lat],
      zoom: zoom
    });
  }, []);

  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    mapContainer,
    map: map.current,
    isLoaded,
    error,
    addMarkers,
    clearMarkers,
    flyToLocation,
    setSelectedOrganization,
    selectedOrganization
  };
};