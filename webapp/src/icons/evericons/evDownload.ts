import { IconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-common-types';

export const prefix = 'ev' as IconPrefix;
export const iconName = 'download' as IconName;
export const width = 24;
export const height = 24;
export const ligatures = [];
export const unicode = '';
export const svgPathData =
  'M22,16 L22,20 C22,21.1045695 21.1045695,22 20,22 L4,22 C2.8954305,22 2,21.1045695 2,20 L2,16 L4,16 L4,20 L20,20 L20,16 L22,16 Z M13,12.5857864 L16.2928932,9.29289322 L17.7071068,10.7071068 L12,16.4142136 L6.29289322,10.7071068 L7.70710678,9.29289322 L11,12.5857864 L11,2 L13,2 L13,12.5857864 Z';

export const definition: IconDefinition = {
  prefix,
  iconName,
  icon: [width, height, ligatures, unicode, svgPathData],
};

export const evDownload = definition;
