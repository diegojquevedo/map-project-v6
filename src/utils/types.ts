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

export interface CSVRow {
  'Organization Name': string;
  'Mission': string;
  'Website': string;
  'Contact Email': string;
  'Headquarters Address': string;
  'Street': string;
  'City': string;
  'State Province': string;
  'Country': string;
  'ZipPostal Code': string;
  'Site Latitude': string;
  'Site Longitude': string;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedOrganization: Organization | null;
}

export interface SearchState {
  query: string;
  results: Organization[];
  isSearching: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}