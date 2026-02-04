import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Organization } from '../utils/types';
import { createMarkerElement, calculateMapBounds, isValidOrganization } from '../utils/mapUtils';

export interface WorldMapProps {
  organizations: Organization[];
  onMarkerClick: (org: Organization) => void;
  selectedOrganization: Organization | null;
  className?: string;
}

const getMapboxToken = (): string => {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  return env?.VITE_MAPBOX_ACCESS_TOKEN ?? env?.VITE_MAPBOX_TOKEN ?? '';
};

export const WorldMap: React.FC<WorldMapProps> = ({
  organizations,
  onMarkerClick,
  selectedOrganization,
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [hasInitializedBounds, setHasInitializedBounds] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = getMapboxToken();
    if (!token) {
      setMapError('Mapbox token missing. Set VITE_MAPBOX_TOKEN in .env');
      return;
    }

    setMapError(null);
    try {
      mapboxgl.accessToken = token;
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 20],
        zoom: 2
      });
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (err) {
      setMapError(err instanceof Error ? err.message : 'Failed to load map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || organizations.length === 0) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    const valid = organizations.filter(isValidOrganization);
    if (valid.length === 0) return;

    valid.forEach((org) => {
      const el = createMarkerElement(org);
      el.addEventListener('click', () => onMarkerClick(org));
      const marker = new mapboxgl.Marker(el)
        .setLngLat([org.siteLongitude, org.siteLatitude])
        .addTo(map.current!);
      markers.current.push(marker);
    });

    // Only fit bounds once on initial load if we have valid organizations
    // Otherwise keep the default world view (zoom 2)
    if (!hasInitializedBounds && valid.length > 0) {
      const bounds = calculateMapBounds(valid);
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        // Only fit bounds if they're not all at 0,0 and span a reasonable area
        const latDiff = Math.abs(ne.lat - sw.lat);
        const lngDiff = Math.abs(ne.lng - sw.lng);
        if (latDiff > 0.1 || lngDiff > 0.1) {
          map.current.fitBounds(bounds, { padding: 50, maxZoom: 4 });
        }
        setHasInitializedBounds(true);
      }
    }
  }, [organizations, onMarkerClick, hasInitializedBounds]);

  useEffect(() => {
    if (!map.current || !selectedOrganization) return;
    if (isValidOrganization(selectedOrganization)) {
      map.current.flyTo({
        center: [selectedOrganization.siteLongitude, selectedOrganization.siteLatitude],
        zoom: 8,
        duration: 1000
      });
    }
  }, [selectedOrganization]);

  if (mapError) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>{mapError}</p>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} style={{ width: '100%', height: '100%' }} />;
};
