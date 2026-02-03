import React from 'react';
import { Organization } from '../utils/types';

export interface SearchResultsProps {
  results: Organization[];
  onCardClick: (org: Organization) => void;
  isVisible: boolean;
  className?: string;
}

const OrganizationCard: React.FC<{
  organization: Organization;
  onClick: (org: Organization) => void;
}> = ({ organization, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-200"
      onClick={() => onClick(organization)}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {organization.organizationName}
      </h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {organization.mission}
      </p>
      <div className="space-y-1">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Location:</span> {organization.city}, {organization.country}
        </p>
        {organization.website && (
          <p className="text-xs text-blue-600 hover:text-blue-800 truncate">
            {organization.website}
          </p>
        )}
      </div>
    </div>
  );
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onCardClick,
  isVisible,
  className = ''
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`bg-gray-50 border-r border-gray-200 overflow-hidden ${className}`}>
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Search Results
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {results.length} organization{results.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className="h-full overflow-y-auto p-4">
        {results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No organizations found matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {results.map((organization, index) => (
              <OrganizationCard
                key={`${organization.organizationName}-${index}`}
                organization={organization}
                onClick={onCardClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};