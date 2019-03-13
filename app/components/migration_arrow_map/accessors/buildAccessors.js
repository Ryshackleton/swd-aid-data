import { extent, nest } from 'd3';
import * as d3Scale from 'd3-scale';
import {
  get, isNaN, isNil, memoize, reduce,
} from 'lodash';
import { cleanCssName } from '../utils/utils';
import { forcePackNodesToRadii } from '../utils/forcePack';
import getArrowAccessors from './arrowAccessors';
import quantizeColorScaleFactory from '../utils/color';

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

function getColorAccessor(settings, state) {
  const {
    colorScale: userColorScale, // user override
    colorPropName,
    colorLegendTitle,
    nodeData,
    colorRange,
    d3ColorScaleName,
    geographyPropName,
  } = state;
  const valueAccessor = d => d[colorPropName];
  const colorExtent = extent(nodeData, valueAccessor);

  let colorScale;
  let colorLegendHtml;
  if (userColorScale) {
    const { scale, legend } = quantizeColorScaleFactory(
      userColorScale,
      15,
      'interpolateRdBu',
      800,
      10,
      colorLegendTitle,
    );
    colorScale = scale;
    colorLegendHtml = legend;
  } else {
    colorScale = d3Scale[d3ColorScaleName]()
      .domain(colorExtent)
      .range(colorRange);
  }

  const colorFromGeoName = nodeData.reduce((acc, datum) => {
    acc[datum[geographyPropName]] = colorScale(valueAccessor(datum));
    return acc;
  }, {});

  return {
    colorAccessor: d => (colorFromGeoName[locationNameFunction(d, settings, state)]),
    colorLegendHtml,
    colorScale: userColorScale,
    colorFromValue: colorScale,
  };
}

function getRadiusAccessors(settings, state) {
  const {
    radiusPropName,
    nodeData,
    geographyPropName,
    radiusRange,
  } = state;

  const valueAccessor = d => Math.abs(d[radiusPropName]);

  const radiusScale = d3Scale.scaleSqrt()
    .domain(extent(nodeData, valueAccessor))
    .range(radiusRange)
    .clamp(true);

  const radiusFromGeoName = nodeData.reduce((acc, datum) => {
    acc[datum[geographyPropName]] = radiusScale(valueAccessor(datum));
    return acc;
  }, {});

  return d => (radiusFromGeoName[locationNameFunction(d, settings, state)]);
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

  const radiusAccessor = getRadiusAccessors(settings, state);
  const {
    colorScale,
    colorAccessor,
    colorFromValue,
    colorLegendHtml,
  } = getColorAccessor(settings, state);

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
    colorScale,
    colorLegendHtml,
    colorAccessor,
    colorFromValue,
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
