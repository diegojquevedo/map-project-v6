import React, { useState, useEffect, useMemo } from 'react';
import { WorldMap } from '../components/WorldMap';
import { SearchInput } from '../components/SearchInput';
import { SearchResults } from '../components/SearchResults';
import { OrganizationPopup } from '../components/OrganizationPopup';
import { Organization, SearchState } from '../utils/types';
import { searchOrganizations } from '../utils/searchUtils';

export interface MapPageProps {}

export const MapPage: React.FC<MapPageProps> = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isSearching: false
  });
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/organizations.csv');
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
        const csvText = await response.text();
        
        // Simple CSV parsing without external parser
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((header: string, index: number) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        const orgs: Organization[] = data.map((row: Record<string, string>) => ({
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
          siteLatitude: parseFloat(row['Site Latitude']) || 0,
          siteLongitude: parseFloat(row['Site Longitude']) || 0
        })).filter((org: Organization) => 
          org.organizationName.trim() !== '' && 
          !isNaN(org.siteLatitude) && 
          !isNaN(org.siteLongitude)
        );

        setOrganizations(orgs);
        setSearchState(prev => ({ ...prev, results: orgs }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  const searchResults = useMemo(() => {
    return searchOrganizations(organizations, searchState.query);
  }, [organizations, searchState.query]);

  useEffect(() => {
    setSearchState(prev => ({
      ...prev,
      results: searchResults,
      isSearching: false
    }));
  }, [searchResults]);

  const handleSearchChange = (query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      isSearching: true
    }));
    setShowResults(query.trim() !== '');
  };

  const handleSearchClear = () => {
    setSearchState({
      query: '',
      results: organizations,
      isSearching: false
    });
    setShowResults(false);
  };

  const handleMarkerClick = (org: Organization) => {
    setSelectedOrganization(org);
  };

  const handleCardClick = (org: Organization) => {
    setSelectedOrganization(org);
    setShowResults(false);
  };

  const handleClosePopup = () => {
    setSelectedOrganization(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ocean research organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ocean Research Organizations</h1>
              <p className="text-sm text-gray-600 mt-1">
                Explore {organizations.length} research organizations worldwide
              </p>
            </div>
            <div className="w-full sm:w-96">
              <SearchInput
                value={searchState.query}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
                placeholder="Search organizations, missions, locations..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <WorldMap
          organizations={organizations}
          onMarkerClick={handleMarkerClick}
          selectedOrganization={selectedOrganization}
          className="w-full h-full"
        />

        <SearchResults
          results={searchState.results}
          onCardClick={handleCardClick}
          isVisible={showResults}
          className="absolute top-4 left-4 w-80 max-h-[calc(100vh-200px)] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-20"
        />

        {selectedOrganization && (
          <OrganizationPopup
            organization={selectedOrganization}
            onClose={handleClosePopup}
          />
        )}
      </div>
    </div>
  );
};