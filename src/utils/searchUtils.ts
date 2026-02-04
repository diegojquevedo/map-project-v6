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

export const searchOrganizations = (organizations: Organization[], query: string): Organization[] => {
  if (!query.trim()) {
    return organizations;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return organizations.filter((org) => {
    const safeStr = (s: string | undefined | null): string => (s ?? '').toLowerCase();
    return (
      safeStr(org.organizationName).includes(searchTerm) ||
      safeStr(org.mission).includes(searchTerm) ||
      safeStr(org.website).includes(searchTerm) ||
      safeStr(org.contactEmail).includes(searchTerm) ||
      safeStr(org.headquartersAddress).includes(searchTerm) ||
      safeStr(org.street).includes(searchTerm) ||
      safeStr(org.city).includes(searchTerm) ||
      safeStr(org.stateProvince).includes(searchTerm) ||
      safeStr(org.country).includes(searchTerm) ||
      safeStr(org.zipPostalCode).includes(searchTerm)
    );
  });
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

export const getSearchResultsCount = (results: Organization[]): string => {
  const count = results.length;
  if (count === 0) {
    return 'No organizations found';
  } else if (count === 1) {
    return '1 organization found';
  } else {
    return `${count} organizations found`;
  }
};

export const sortSearchResults = (results: Organization[], sortBy: 'name' | 'country' | 'relevance' = 'name'): Organization[] => {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.organizationName.localeCompare(b.organizationName);
      case 'country':
        return a.country.localeCompare(b.country);
      case 'relevance':
      default:
        return a.organizationName.localeCompare(b.organizationName);
    }
  });
};