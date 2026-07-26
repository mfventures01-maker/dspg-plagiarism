import { Branding } from './Branding';

export const metadata = {
  title: Branding.applicationName,
  description: `Official Plagiarism Checking system for ${Branding.institution} - ${Branding.committee}`,
  themeColor: Branding.colors.primary,
  openGraph: {
    title: Branding.applicationName,
    description: `Academic integrity verification for ${Branding.institution}`,
    url: 'https://dspg-plagiarism-checker.vercel.app',
    siteName: Branding.shortName,
    images: [
      {
        url: Branding.logoPng,
        width: 800,
        height: 600,
      }
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: Branding.applicationName,
    description: `Academic integrity verification for ${Branding.institution}`,
    images: [Branding.logoPng],
  },
};
