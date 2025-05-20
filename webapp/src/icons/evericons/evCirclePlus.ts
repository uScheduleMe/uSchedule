import { IconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-common-types';

export const prefix = 'ev' as IconPrefix;
export const iconName = 'circle-plus' as IconName;
export const width = 24;
export const height = 24;
export const ligatures = [];
export const unicode = '';
export const svgPathData =
  'M12,23 C5.92486775,23 1,18.0751322 1,12 C1,5.92486775 5.92486775,1 12,1 C18.0751322,1 23,5.92486775 23,12 C23,18.0751322 18.0751322,23 12,23 Z M12,21 C16.9705627,21 21,16.9705627 21,12 C21,7.02943725 16.9705627,3 12,3 C7.02943725,3 3,7.02943725 3,12 C3,16.9705627 7.02943725,21 12,21 Z M13,11 L17,11 L17,13 L13,13 L13,17 L11,17 L11,13 L7,13 L7,11 L11,11 L11,7 L13,7 L13,11 Z';

export const definition: IconDefinition = {
  prefix,
  iconName,
  icon: [width, height, ligatures, unicode, svgPathData],
};

export const evCirclePlus = definition;
