import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import type { BrandingSettings } from '../types';

const defaultBranding: BrandingSettings = {
  site_name: 'Watered',
  parent_website_url: 'http://mywatered.com/',
  site_logo_url: '',
  favicon_url: '',
  email_logo_url: '',
  primary_color: '#966922',
};

export const useBranding = () => {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    settingsService
      .getPublicSettings()
      .then((data) => {
        if (mounted && data) {
          setBranding(data);
          if (data.favicon_url) {
            const link: HTMLLinkElement | null =
              document.querySelector("link[rel*='icon']");
            if (link) {
              link.href = data.favicon_url;
            } else {
              const newLink = document.createElement('link');
              newLink.rel = 'shortcut icon';
              newLink.href = data.favicon_url;
              document.head.appendChild(newLink);
            }
          }
          if (data.site_name) {
            document.title = `${data.site_name} Portal`;
          }
        }
      })
      .catch(() => {
        // use defaults on failure
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { branding, loading };
};
