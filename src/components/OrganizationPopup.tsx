import React from 'react';
import { Organization } from '../utils/types';

export interface OrganizationPopupProps {
  organization: Organization;
  onClose: () => void;
  className?: string;
}

export const OrganizationPopup: React.FC<OrganizationPopupProps> = ({
  organization,
  onClose,
  className = ''
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatWebsiteUrl = (website: string): string => {
    if (!website) return '';
    if (website.startsWith('http://') || website.startsWith('https://')) {
      return website;
    }
    return `https://${website}`;
  };

  const formatAddress = (): string => {
    const parts = [
      organization.street,
      organization.city,
      organization.stateProvince,
      organization.country,
      organization.zipPostalCode
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            {organization.organizationName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close popup"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {organization.mission && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Mission</h3>
              <p className="text-gray-900 leading-relaxed">{organization.mission}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                Contact Information
              </h3>
              
              {organization.website && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Website:</span>
                  <div className="mt-1">
                    <a
                      href={formatWebsiteUrl(organization.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {organization.website}
                    </a>
                  </div>
                </div>
              )}

              {organization.contactEmail && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <div className="mt-1">
                    <a
                      href={`mailto:${organization.contactEmail}`}
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {organization.contactEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                Location
              </h3>
              
              {(organization.headquartersAddress || formatAddress()) && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Address:</span>
                  <div className="mt-1 text-gray-900">
                    {organization.headquartersAddress || formatAddress()}
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-gray-600">Coordinates:</span>
                <div className="mt-1 text-gray-900 font-mono text-sm">
                  {organization.siteLatitude.toFixed(6)}, {organization.siteLongitude.toFixed(6)}
                </div>
              </div>
            </div>
          </div>

          {(organization.city || organization.stateProvince || organization.country) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Location Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {organization.city && (
                  <div>
                    <span className="font-medium text-gray-600">City:</span>
                    <div className="text-gray-900">{organization.city}</div>
                  </div>
                )}
                {organization.stateProvince && (
                  <div>
                    <span className="font-medium text-gray-600">State/Province:</span>
                    <div className="text-gray-900">{organization.stateProvince}</div>
                  </div>
                )}
                {organization.country && (
                  <div>
                    <span className="font-medium text-gray-600">Country:</span>
                    <div className="text-gray-900">{organization.country}</div>
                  </div>
                )}
                {organization.zipPostalCode && (
                  <div>
                    <span className="font-medium text-gray-600">Postal Code:</span>
                    <div className="text-gray-900">{organization.zipPostalCode}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};