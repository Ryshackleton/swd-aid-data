import { geoPath } from 'd3';

export const defaultSettings = {
  bubbleDefaultOpacity: 0.9,
  css: {
    containerDivId: '', // for use outside of observable
    svgClass: 'map',
    groups: {
      colorLegend: 'colorLegend',
      arrowLegend: 'arrowLegend',
      geography: 'geography',
      bubbles: 'bubbles',
      arrows: 'arrows',
      arrowsSelect: 'arrowsSelect',
      voronoi: 'voronoi',
      labels: 'labels',
    },
  },
  path: geoPath(),
  transition: { duration: 1000 },
  viewBoxXPan: 0,
  viewBoxYPan: 0,
  // topojson props
  topoJSONBaseWidth: 1000, // width scaling associated with the topojson
  topoJSONBaseHeight: 520, // width scaling associated with the topojson
  topology: {}, // picked off of props
  featureSets: ['states'],
  topojsonLocationPropName: 'location_name',
};

export const settingsKeys = Object.keys(defaultSettings);
