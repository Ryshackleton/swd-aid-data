import { extent, nest } from 'd3';
import * as d3Scale from 'd3-scale';
import {
  get, isNaN, isNil, memoize, reduce,
} from 'lodash';
import { cleanCssName } from '../utils/utils';
import { forcePackNodesToRadii } from '../utils/forcePack';
import getArrowAccessors from './arrowAccessors';

function locationNameFunction(datum, settings, state) {
  const { topojsonLocationPropName } = settings;
  const { geographyPropName } = state;
  return get( // try to get name from the data prop array
    datum,
    geographyPropName,
    get(datum, ['properties', topojsonLocationPropName]), // must be looking at a feature
  );
}

function geoCentroidLookup(settings) {
  const {
    features,
    topojsonLocationPropName: locPropName,
  } = settings;
  return features
    .reduce((acc, eachFeature) => {
      acc[eachFeature.properties[locPropName]] = eachFeature.properties.poleOfInaccessibility;
      return acc;
    }, {});
}

const getGeoCentroidLookup = memoize(
  geoCentroidLookup,
  ({
    featureSets,
    path,
    topojsonLocationPropName,
  }) => (JSON.stringify({ featureSets, path, topojsonLocationPropName })),
);

function getRadiusAndColorAccessors(settings, state) {
  const {
    colorPropName,
    nodeData,
    colorRange,
    d3ColorScaleName,
    geographyPropName,
    radiusRange,
  } = state;

  const valueAccessor = d => d[colorPropName];

  const colorPropDomain = extent(nodeData, valueAccessor);
  const colorScale = d3Scale[d3ColorScaleName]()
    .domain(colorPropDomain)
    .range(colorRange);
  const radiusScale = d3Scale.scaleSqrt()
    .domain(colorPropDomain)
    .range(radiusRange)
    .clamp(true);

  const radiusFromGeoName = nodeData.reduce((acc, datum) => {
    acc[datum[geographyPropName]] = radiusScale(valueAccessor(datum));
    return acc;
  }, {});
  const colorFromGeoName = nodeData.reduce((acc, datum) => {
    acc[datum[geographyPropName]] = colorScale(valueAccessor(datum));
    return acc;
  }, {});

  return {
    colorAccessor: d => (colorFromGeoName[locationNameFunction(d, settings, state)]),
    radiusAccessor: d => (radiusFromGeoName[locationNameFunction(d, settings, state)]),
  };
}

function getBubbleCentroidLookup(settings, state, radiusAccessor) {
  const { geographyPropName, bubbleRadiusPadding } = state;
  const {
    topoJSONBaseWidth: width, // width scaling associated with the topojson
    topoJSONBaseHeight: height, // width scaling associated with the topojson
  } = settings;
  // shape data for force packing
  const nodes = reduce(getGeoCentroidLookup(settings, state),
    (acc, coords, geoname) => {
      const x = coords[0];
      const y = coords[1];
      const lookup = { [geographyPropName]: geoname };
      if (!isNaN(coords[0]) && !isNaN(coords[1]) && !isNil(radiusAccessor(lookup))) {
        acc.push({
          ...lookup,
          x,
          y,
        });
      }
      return acc;
    }, []);

  // pack
  return (forcePackNodesToRadii({
    nodes,
    xAccessor: d => d.x,
    yAccessor: d => d.y,
    radiusAccessor,
    radiusPadding: bubbleRadiusPadding,
    width,
    height,
  }))
  // reshape back to the array format used in this notebook
    .reduce((acc, node) => {
      acc[node[geographyPropName]] = [node.x, node.y];
      return acc;
    }, {});
}

function getGeographyClassAccessor(settings, state) {
  return datum => (cleanCssName(locationNameFunction(datum, settings, state)));
}

function getCssNameLookup(settings, state) {
  const {
    nodeData,
    geographyPropName,
  } = state;

  return nest()
    .key(d => d[geographyPropName])
    .rollup(leafGeometry => cleanCssName(leafGeometry[0][geographyPropName]))
    .object(nodeData);
}

function buildAccessors(settings, state) {
  const {
    geographyPropName,
    isCartogram,
  } = state;

  const {
    radiusAccessor,
    colorAccessor,
  } = getRadiusAndColorAccessors(settings, state);

  const centroidLookup = isCartogram
    ? getBubbleCentroidLookup(settings, state, radiusAccessor)
    : getGeoCentroidLookup(settings, state);

  const cssNameLookup = getCssNameLookup(settings, state);

  return {
    ...state,
    ...getArrowAccessors(
      settings,
      {
        ...state,
        radiusAccessor,
        centroidLookup,
        cssNameLookup,
      },
    ),
    colorAccessor,
    cssNameLookup,
    geographyClassAccessor: getGeographyClassAccessor(settings, state),
    radiusAccessor,
    xAccessor: datum => centroidLookup[datum[geographyPropName]][0],
    yAccessor: datum => centroidLookup[datum[geographyPropName]][1],
  };
}

export default memoize(
  buildAccessors,
  (_, { flowData, nodeData, ...rest }) => (JSON.stringify(rest)),
);
