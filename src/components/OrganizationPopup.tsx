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
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid #000'
        }}
      >
        <div style={{ borderBottom: '1px solid #000', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#000' }}>
            {organization.organizationName}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              lineHeight: 1,
              cursor: 'pointer',
              color: '#666',
              padding: 0,
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          {organization.mission && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Mission</h3>
              <p style={{ fontSize: '14px', color: '#000', lineHeight: 1.5, margin: 0 }}>{organization.mission}</p>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Contact</h3>
            {organization.website && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>Website: </span>
                <a
                  href={formatWebsiteUrl(organization.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: '#000', textDecoration: 'underline' }}
                >
                  {organization.website}
                </a>
              </div>
            )}
            {organization.contactEmail && (
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Email: </span>
                <a
                  href={`mailto:${organization.contactEmail}`}
                  style={{ fontSize: '12px', color: '#000', textDecoration: 'underline' }}
                >
                  {organization.contactEmail}
                </a>
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Location</h3>
            {(organization.headquartersAddress || formatAddress()) && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>Address: </span>
                <span style={{ fontSize: '12px', color: '#000' }}>{organization.headquartersAddress || formatAddress()}</span>
              </div>
            )}
            <div>
              <span style={{ fontSize: '12px', color: '#666' }}>Coordinates: </span>
              <span style={{ fontSize: '12px', color: '#000', fontFamily: 'monospace' }}>
                {organization.siteLatitude.toFixed(6)}, {organization.siteLongitude.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
