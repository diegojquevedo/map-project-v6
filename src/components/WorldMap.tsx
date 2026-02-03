import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Organization } from '../utils/types';
import { createMarkerElement, calculateMapBounds, isValidOrganization } from '../utils/mapUtils';

export interface WorldMapProps {
  organizations: Organization[];
  onMarkerClick: (org: Organization) => void;
  selectedOrganization: Organization | null;
  className?: string;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  organizations,
  onMarkerClick,
  selectedOrganization,
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = (import.meta as any).env.VITE_MAPBOX_ACCESS_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 2,
      projection: 'mercator'
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const validOrganizations = organizations.filter(isValidOrganization);

    validOrganizations.forEach((org) => {
      const markerElement = createMarkerElement(org);
      
      markerElement.addEventListener('click', () => {
        onMarkerClick(org);
      });

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([org.siteLongitude, org.siteLatitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });

    if (validOrganizations.length > 0) {
      const bounds = calculateMapBounds(validOrganizations);
      if (bounds) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 10
        });
      }
    }
  }, [organizations, onMarkerClick]);

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

  return (
    <div 
      ref={mapContainer}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};