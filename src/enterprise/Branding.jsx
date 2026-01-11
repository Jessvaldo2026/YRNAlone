// FILE: src/enterprise/Branding.jsx
// Shows organization logo and custom branding

import React from 'react';
import { useEnterprise } from './EnterpriseContext';

// Use this component at the top of your app/home screen
const OrganizationBanner = () => {
  const { isEnterprise, branding } = useEnterprise();

  if (!isEnterprise || !branding) return null;

  return (
    <div className="org-banner" style={{
      background: `linear-gradient(135deg, ${branding.primaryColor}22, ${branding.primaryColor}11)`,
      borderBottom: `2px solid ${branding.primaryColor}`,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      {branding.logo && (
        <img 
          src={branding.logo} 
          alt={branding.name} 
          style={{
            height: '32px',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
      )}
      <span style={{ 
        color: branding.primaryColor,
        fontWeight: 500,
        fontSize: '0.9rem'
      }}>
        {branding.welcomeMessage}
      </span>
    </div>
  );
};

// Use this for branded buttons
const BrandedButton = ({ children, onClick, style = {} }) => {
  const { branding } = useEnterprise();
  const color = branding?.primaryColor || '#7C3AED';

  return (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '10px',
        fontWeight: 600,
        cursor: 'pointer',
        ...style
      }}
    >
      {children}
    </button>
  );
};

// Powered by badge (shows at bottom)
const PoweredByBadge = () => {
  const { isEnterprise, branding } = useEnterprise();

  return (
    <div style={{
      textAlign: 'center',
      padding: '20px',
      color: '#999',
      fontSize: '0.8rem'
    }}>
      {isEnterprise && branding ? (
        <>
          Provided by <strong>{branding.name}</strong> • Powered by YRNAlone
        </>
      ) : (
        <>Powered by YRNAlone 💜</>
      )}
    </div>
  );
};

export { OrganizationBanner, BrandedButton, PoweredByBadge };
