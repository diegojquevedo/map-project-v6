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

export interface ApiError {
  message: string;
  status?: number;
}

interface ParseResult {
  data: CSVRow[];
  errors: Array<{ message: string; row?: number }>;
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

const parseCSV = (csvText: string): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      resolve({
        data: [],
        errors: [{ message: 'No data found' }],
        meta: {
          delimiter: ',',
          linebreak: '\n',
          aborted: false,
          truncated: false,
          cursor: 0
        }
      });
      return;
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const data: CSVRow[] = [];
    const errors: Array<{ message: string; row?: number }> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        errors.push({ message: `Row ${i + 1} has ${values.length} columns, expected ${headers.length}`, row: i + 1 });
        continue;
      }

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row as unknown as CSVRow);
    }

    resolve({
      data,
      errors,
      meta: {
        delimiter: ',',
        linebreak: '\n',
        aborted: false,
        truncated: false,
        cursor: csvText.length
      }
    });
  });
};

const transformCSVRowToOrganization = (row: CSVRow): Organization | null => {
  try {
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
      siteLongitude: longitude
    };
  } catch (error) {
    return null;
  }
};

export const parseCSVData = async (csvText: string): Promise<Organization[]> => {
  try {
    const result = await parseCSV(csvText);
    
    if (result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }

    const organizations: Organization[] = [];
    
    for (const row of result.data) {
      const organization = transformCSVRowToOrganization(row);
      if (organization) {
        organizations.push(organization);
      }
    }

    return organizations;
  } catch (error) {
    throw new Error(`Failed to parse CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const validateCSVStructure = (csvText: string): { isValid: boolean; errors: string[] } => {
  const requiredHeaders = [
    'Organization Name',
    'Mission',
    'Website',
    'Contact Email',
    'Headquarters Address',
    'Street',
    'City',
    'State Province',
    'Country',
    'ZipPostal Code',
    'Site Latitude',
    'Site Longitude'
  ];

  const errors: string[] = [];
  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    errors.push('CSV file is empty');
    return { isValid: false, errors };
  }

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      errors.push(`Missing required header: ${requiredHeader}`);
    }
  }

  if (lines.length < 2) {
    errors.push('CSV file must contain at least one data row');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};