import 'i18next';

import { resources, typeableConfig } from '../src/i18n';

type TypeableConfig = typeof typeableConfig;

declare module 'i18next' {
  interface CustomTypeOptions extends TypeableConfig {
    resources: (typeof resources)['en'];
  }
}
