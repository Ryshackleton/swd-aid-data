import { extent } from 'd3';
import * as d3Scale from 'd3-scale'
import { get, map } from 'lodash';
import { feature } from 'topojson';
import { cleanCssName } from '../utils/utils';
import { forcePackNodesToRadii } from '../utils/forcePack';

function locationNameFunction(datum, props, state) {
  const { topojsonLocationPropName } = props;
  const { geographyPropName } = state;
  return get( // try to get name from the data prop array
    datum,
    geographyPropName,
    get(datum, ['properties', topojsonLocationPropName]), // must be looking at a feature
  );
}

function getGeoCentroidLookup(props) {
  const {
    featureSet,
    path,
    topology,
    topojsonLocationPropName,
  } = props;

  return feature(topology, topology.objects[featureSet]).features
    .reduce((acc, eachFeature) => {
      acc[eachFeature.properties[topojsonLocationPropName]] = path.centroid(eachFeature);
      return acc;
    }, {});
}

function getRadiusAndColorAccessors(props, state) {
  const {
    colorPropName,
    colorRadiusData,
    colorRange,
    d3ColorScaleName,
    geographyPropName,
    radiusRange,
  } = state;

  const valueAccessor = d => d[colorPropName];

  const colorPropDomain = extent(colorRadiusData, valueAccessor);
  const colorScale = d3Scale[d3ColorScaleName]()
    .domain(colorPropDomain)
    .range(colorRange);
  const radiusScale = d3Scale.scaleSqrt()
    .domain(colorPropDomain)
    .range(radiusRange)
    .clamp(true);

  const radiusFromGeoName = colorRadiusData.reduce((acc, datum) => {
    acc[datum[geographyPropName]] = radiusScale(valueAccessor(datum));
    return acc;
  }, {});
  const colorFromGeoName = colorRadiusData.reduce((acc, datum) => {
    acc[datum[geographyPropName]] = colorScale(valueAccessor(datum));
    return acc;
  }, {});

  return {
    colorAccessor: d => (colorFromGeoName[locationNameFunction(d, props, state)]),
    radiusAccessor: d => (radiusFromGeoName[locationNameFunction(d, props, state)]),
  };
}

function getBubbleCentroidLookup(props, state, radiusAccessor) {
  const { geographyPropName } = state;
  // shape data for force packing
  const nodes = map(getGeoCentroidLookup(props, state),
    (coords, geoname) => ({
      x: coords[0],
      y: coords[1],
      [geographyPropName]: geoname,
    }));

  // pack
  return (forcePackNodesToRadii({
    nodes,
    xAccessor: d => d.x,
    yAccessor: d => d.y,
    radiusAccessor,
    radiusPadding: 5,
  }))
  // reshape back to the array format used in this notebook
    .reduce((acc, node) => {
      acc[node[geographyPropName]] = [node.x, node.y];
      return acc;
    }, {});
}

function getGeographyClassAccessor(props, state) {
  return datum => (cleanCssName(locationNameFunction(datum, props, state)));
}

export function buildAccessors(props, state) {
  const {
    geographyPropName,
    isCartogram,
  } = state;

  const { radiusAccessor, colorAccessor } = getRadiusAndColorAccessors(props, state);

  const centroidLookup = isCartogram
    ? getBubbleCentroidLookup(props, state, radiusAccessor)
    : getGeoCentroidLookup(props, state);

  return {
    colorAccessor,
    radiusAccessor,
    geographyClassAccessor: getGeographyClassAccessor(props, state),
    xAccessor: datum => centroidLookup[datum[geographyPropName]][0],
    yAccessor: datum => centroidLookup[datum[geographyPropName]][1],
  };
}
