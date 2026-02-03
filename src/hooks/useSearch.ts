import { useState, useEffect, useMemo } from 'react';

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

export interface SearchState {
  query: string;
  results: Organization[];
  isSearching: boolean;
}

export const useSearch = (organizations: Organization[]) => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isSearching: false
  });
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.query);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchState.query]);

  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }

    const query = debouncedQuery.toLowerCase();
    return organizations.filter((org) => {
      return (
        org.organizationName.toLowerCase().includes(query) ||
        org.mission.toLowerCase().includes(query) ||
        org.city.toLowerCase().includes(query) ||
        org.country.toLowerCase().includes(query) ||
        org.stateProvince.toLowerCase().includes(query)
      );
    });
  }, [organizations, debouncedQuery]);

  useEffect(() => {
    setSearchState(prev => ({
      ...prev,
      results: filteredResults,
      isSearching: false
    }));
  }, [filteredResults]);

  const setQuery = (query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      isSearching: query.trim().length > 0
    }));
  };

  const clearSearch = () => {
    setSearchState({
      query: '',
      results: [],
      isSearching: false
    });
    setDebouncedQuery('');
  };

  return {
    searchState,
    setQuery,
    clearSearch
  };
};