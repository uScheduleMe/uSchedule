import { HTMLAttributes } from 'react';

// Adapted from https://stackoverflow.com/a/57065680/5850138

export const providerList = ['facebook', 'google', 'microsoft'] as const;

type ProviderId = (typeof providerList)[number];

export const isProvider = (item: string): item is ProviderId =>
  (providerList as readonly string[]).includes(item);

export interface SignInOptionsProps extends HTMLAttributes<HTMLElement> {
  providers?: ProviderId[];
}

export interface IdentityProvider {
  name: string;
  image: string;
}

export const providerInfo: Record<ProviderId, IdentityProvider> = {
  facebook: {
    name: 'Facebook',
    image: '/icon-facebook.svg',
  },
  google: {
    name: 'Google',
    image: '/icon-google.svg',
  },
  microsoft: {
    name: 'Microsoft',
    image: '/icon-microsoft.svg',
  },
};
