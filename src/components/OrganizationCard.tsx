import React from 'react';
import { Organization } from '../utils/types';

export interface OrganizationCardProps {
  organization: Organization;
  onClick: (org: Organization) => void;
  isSelected?: boolean;
  className?: string;
}

function formatAddress(org: Organization): string {
  const parts = [org.city, org.stateProvince, org.country].filter(
    (part) => part != null && part.trim() !== ''
  );
  return parts.join(', ');
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onClick,
  isSelected = false,
  className = ''
}) => {
  return (
    <button
      type="button"
      className={className}
      onClick={() => onClick(organization)}
      style={{
        width: '100%',
        textAlign: 'left',
        border: '1px solid #000',
        background: isSelected ? '#f5f5f5' : '#fff',
        cursor: 'pointer',
        transition: 'background 0.2s',
        padding: 0
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
      onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? '#f5f5f5' : '#fff')}
    >
      <div style={{ height: '1px', width: '100%', background: '#000' }} />
      <div style={{ padding: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {organization.organizationName}
        </h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {organization.mission}
        </p>
        <p style={{ fontSize: '11px', color: '#999' }}>{formatAddress(organization)}</p>
        {organization.website?.trim() && (
          <p style={{ fontSize: '11px', color: '#999', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{organization.website}</p>
        )}
      </div>
    </button>
  );
};
