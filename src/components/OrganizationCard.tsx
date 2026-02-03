import React from 'react';
import { Organization } from '../utils/types';

export interface OrganizationCardProps {
  organization: Organization;
  onClick: (org: Organization) => void;
  isSelected?: boolean;
  className?: string;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onClick,
  isSelected = false,
  className = ''
}) => {
  const handleClick = () => {
    onClick(organization);
  };

  const formatAddress = (org: Organization): string => {
    const parts = [org.city, org.stateProvince, org.country].filter(part => part && part.trim());
    return parts.join(', ');
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className="bg-black h-2 rounded-t-lg"></div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {organization.organizationName}
        </h3>
        <p className="font-sans text-sm text-gray-600 mb-3 line-clamp-3">
          {organization.mission}
        </p>
        <div className="space-y-1">
          <p className="font-sans text-xs text-gray-500">
            {formatAddress(organization)}
          </p>
          {organization.website && (
            <p className="font-sans text-xs text-blue-600 hover:text-blue-800 truncate">
              {organization.website}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};