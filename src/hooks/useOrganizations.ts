import { useState, useEffect } from 'react';

interface Organization {
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

interface CSVRow {
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

interface ApiError {
  message: string;
  status?: number;
}

interface UseOrganizationsReturn {
  organizations: Organization[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1234567890/export?format=csv';

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = parseCSVRow(lines[0]);
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row as unknown as CSVRow);
    }
  }
  
  return rows;
}

function transformCSVRowToOrganization(row: CSVRow): Organization | null {
  const latitude = parseFloat(row['Site Latitude']);
  const longitude = parseFloat(row['Site Longitude']);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }
  
  return {
    organizationName: row['Organization Name'] || '',
    mission: row['Mission'] || '',
    website: row['Website'] || '',
    contactEmail: row['Contact Email'] || '',
    headquartersAddress: row['Headquarters Address'] || '',
    street: row['Street'] || '',
    city: row['City'] || '',
    stateProvince: row['State Province'] || '',
    country: row['Country'] || '',
    zipPostalCode: row['ZipPostal Code'] || '',
    siteLatitude: latitude,
    siteLongitude: longitude,
  };
}

export function useOrganizations(): UseOrganizationsReturn {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchOrganizations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(CSV_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const csvRows = parseCSV(csvText);
      
      const validOrganizations = csvRows
        .map(transformCSVRowToOrganization)
        .filter((org): org is Organization => org !== null);
      
      setOrganizations(validOrganizations);
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        status: err instanceof Error && 'status' in err ? (err as { status: number }).status : undefined,
      };
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  const refetch = (): void => {
    fetchOrganizations();
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    refetch,
  };
}