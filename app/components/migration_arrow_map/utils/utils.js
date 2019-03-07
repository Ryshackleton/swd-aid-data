import { feature } from 'topojson';

export function cleanCssName(string) {
  return `__${string.toString().split(' ').join('')}__`;
}

export function getFeatureArray({ topology, featureSets }) {
  return featureSets.reduce((acc, set) => (
    acc.concat(feature(topology, topology.objects[set]).features)
  ), []);
}
