import { geoPath } from 'd3';

export const defaultSettings = {
  bubbleDefaultOpacity: 0.9,
  css: {
    containerDivId: '', // for use outside of observable
    svgClass: 'map',
    groups: {
      geography: 'geography',
      bubbles: 'bubbles',
      arrows: 'arrows',
      voronoi: 'voronoi',
      labels: 'labels',
    },
  },
  path: geoPath(),
  transition: { duration: 1000 },
  // topojson props
  topoJSONBaseWidth: 900, // width scaling associated with the topojson
  topoJSONBaseHeight: 550, // width scaling associated with the topojson
  topology: {}, // picked off of props
  featureSets: ['states'],
  topojsonLocationPropName: 'location_name',
};

export const settingsKeys = Object.keys(defaultSettings);
