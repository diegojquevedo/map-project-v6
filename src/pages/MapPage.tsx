import React, { useState, useEffect, useMemo } from 'react';
import { WorldMap } from '../components/WorldMap';
import { SearchInput } from '../components/SearchInput';
import { OrganizationCard } from '../components/OrganizationCard';
import { OrganizationPopup } from '../components/OrganizationPopup';
import { Organization } from '../utils/types';
import { searchOrganizations } from '../utils/searchUtils';

const getCsvUrl = (): string => {
  const env = (import.meta as { env?: Record<string, string> }).env;
  return env?.VITE_CSV_DATA_URL ?? '';
};

// Simple CSV parser that handles quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const MapPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const csvUrl = getCsvUrl().trim();
    if (!csvUrl) {
      setError('VITE_CSV_DATA_URL is not set in .env');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const csvText = await response.text();
        if (cancelled) return;

        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          setOrganizations([]);
          return;
        }

        const toNum = (s: string | undefined): number => {
          if (!s || s.trim() === '') return 0;
          const n = Number.parseFloat(s.trim());
          return Number.isNaN(n) ? 0 : n;
        };

        const headers = parseCSVLine(lines[0]);
        const data = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const row: Record<string, string> = {};
          headers.forEach((header: string, i: number) => {
            row[header] = values[i] ?? '';
          });
          return row;
        });

        const orgs: Organization[] = data
          .map((row: Record<string, string>) => ({
            organizationName: row['Organization Name'] ?? '',
            mission: row['Mission'] ?? '',
            website: row['Website'] ?? '',
            contactEmail: row['Contact Email'] ?? '',
            headquartersAddress: row['Headquarters Address'] ?? '',
            street: row['Street'] ?? '',
            city: row['City'] ?? '',
            stateProvince: row['State Province'] ?? '',
            country: row['Country'] ?? '',
            zipPostalCode: row['ZipPostal Code'] ?? '',
            siteLatitude: toNum(row['Site Latitude']),
            siteLongitude: toNum(row['Site Longitude'])
          }))
          .filter(
            (org: Organization) =>
              org.organizationName.trim() !== '' &&
              org.siteLatitude !== 0 &&
              org.siteLongitude !== 0 &&
              !Number.isNaN(org.siteLatitude) &&
              !Number.isNaN(org.siteLongitude) &&
              org.siteLatitude >= -90 &&
              org.siteLatitude <= 90 &&
              org.siteLongitude >= -180 &&
              org.siteLongitude <= 180
          );

        if (cancelled) return;
        setOrganizations(orgs);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrgs = useMemo(() => {
    if (!searchQuery.trim()) return organizations;
    return searchOrganizations(organizations, searchQuery);
  }, [organizations, searchQuery]);

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: '#000', fontWeight: 600, marginBottom: '8px' }}>Error loading data</p>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ border: '1px solid #000', background: '#fff', color: '#000', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Panel izquierdo: 30% */}
      <div style={{ width: '30%', borderRight: '1px solid #000', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #000', padding: '12px' }}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search…"
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          <p style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>
            {filteredOrgs.length} organization{filteredOrgs.length !== 1 ? 's' : ''}
          </p>
          {filteredOrgs.length === 0 ? (
            <p style={{ color: '#666', fontSize: '14px' }}>No organizations match.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredOrgs.map((org, i) => (
                <OrganizationCard
                  key={i}
                  organization={org}
                  onClick={setSelectedOrganization}
                  isSelected={selectedOrganization === org}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mapa derecho: 70% */}
      <div style={{ width: '70%', position: 'relative' }}>
        <WorldMap
          organizations={organizations}
          onMarkerClick={setSelectedOrganization}
          selectedOrganization={selectedOrganization}
        />
      </div>

      {selectedOrganization && (
        <OrganizationPopup organization={selectedOrganization} onClose={() => setSelectedOrganization(null)} />
      )}
    </div>
  );
};
