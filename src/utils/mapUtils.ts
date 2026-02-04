import { LngLatBounds } from 'mapbox-gl';

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

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const isValidOrganization = (org: Organization): boolean => {
  return (
    org.organizationName.trim() !== '' &&
    validateCoordinates(org.siteLatitude, org.siteLongitude) &&
    !isNaN(org.siteLatitude) &&
    !isNaN(org.siteLongitude) &&
    org.siteLatitude !== 0 &&
    org.siteLongitude !== 0
  );
};

export const createMarkerElement = (organization: Organization): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.style.width = '16px';
  el.style.height = '16px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = '#000';
  el.style.border = '2px solid #fff';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
  el.setAttribute('data-organization', organization.organizationName);
  return el;
};

export const calculateMapBounds = (organizations: Organization[]): LngLatBounds | null => {
  const validOrgs = organizations.filter(isValidOrganization);
  
  if (validOrgs.length === 0) {
    return null;
  }

  const bounds = new LngLatBounds();
  
  validOrgs.forEach(org => {
    bounds.extend([org.siteLongitude, org.siteLatitude]);
  });

  return bounds;
};

export const formatCoordinates = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

export const getDistanceBetweenPoints = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findNearbyOrganizations = (
  targetOrg: Organization,
  allOrgs: Organization[],
  radiusKm: number = 100
): Organization[] => {
  return allOrgs.filter(org => {
    if (org.organizationName === targetOrg.organizationName) {
      return false;
    }
    
    const distance = getDistanceBetweenPoints(
      targetOrg.siteLatitude,
      targetOrg.siteLongitude,
      org.siteLatitude,
      org.siteLongitude
    );
    
    return distance <= radiusKm;
  });
};

export const getMapCenter = (organizations: Organization[]): [number, number] => {
  const validOrgs = organizations.filter(isValidOrganization);
  
  if (validOrgs.length === 0) {
    return [0, 0];
  }
  
  const avgLat = validOrgs.reduce((sum, org) => sum + org.siteLatitude, 0) / validOrgs.length;
  const avgLng = validOrgs.reduce((sum, org) => sum + org.siteLongitude, 0) / validOrgs.length;
  
  return [avgLng, avgLat];
};

export const getOptimalZoom = (organizations: Organization[]): number => {
  const bounds = calculateMapBounds(organizations);
  
  if (!bounds) {
    return 2;
  }
  
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  
  const latDiff = Math.abs(ne.lat - sw.lat);
  const lngDiff = Math.abs(ne.lng - sw.lng);
  
  const maxDiff = Math.max(latDiff, lngDiff);
  
  if (maxDiff > 100) return 2;
  if (maxDiff > 50) return 3;
  if (maxDiff > 20) return 4;
  if (maxDiff > 10) return 5;
  if (maxDiff > 5) return 6;
  if (maxDiff > 2) return 7;
  if (maxDiff > 1) return 8;
  return 9;
};
