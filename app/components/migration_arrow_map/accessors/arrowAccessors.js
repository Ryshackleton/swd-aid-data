import Victor from 'victor';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  extent, nest, scaleLinear,
} from 'd3';
import { memoize, pick } from 'lodash';
import { cleanCssName } from '../utils/utils';
import curvedPath from '../lib/curvedPath';

export const getArrowMetadata = memoize(
  (settings, state) => {
    const {
      arrowOriginPropName,
      arrowDestinationPropName,
      arrowFlowPropName,
      arrowScaleColorRange,
      centroidLookup,
      flowData,
      isOriginFocused,
    } = state;

    const originProp = isOriginFocused ? arrowOriginPropName : arrowDestinationPropName;
    const destinationProp = isOriginFocused ? arrowDestinationPropName : arrowOriginPropName;

    return nest()
      .key(d => d[originProp])
      .rollup((leafFeatures) => {
        // compute connected opacity scales
        const leafFlowExtent = extent(leafFeatures, d => Math.abs(d[arrowFlowPropName]));
        const bubbleOpacityScale = scaleLinear()
          .domain(leafFlowExtent)
          .range([0.75, 1]);
        const metadataObject = leafFeatures.reduce((acc, feature) => {
          acc.connected_arrows.push(feature);
          // names
          const originLoc = feature[originProp];
          const destLoc = feature[destinationProp];
          // save connected names to array
          acc.connected_css.push(cleanCssName(destLoc));
          acc.connected_loc_opacity[destLoc] = bubbleOpacityScale(feature[arrowFlowPropName]);
          acc.connected_loc_opacity[originLoc] = 1; // set my own opacity to 1

          // compute mean resultant
          // Victor.js - note that these Victor functions ALWAYS mutate unless the Victor is cloned
          const origin = new Victor(...centroidLookup[originLoc]);
          const destination = new Victor(...centroidLookup[destLoc]);
          const originToDest = destination.clone().subtract(origin);
          acc.mean.add(originToDest);

          return acc;
        }, {
          mean: new Victor(0, 0), connected_arrows: [], connected_css: [], connected_loc_opacity: {},
        });

        // normalize the mean
        metadataObject.mean.normalize();

        // sort arrows ascending to ensure bigger ones are on top (draw order)
        metadataObject.connected_arrows = metadataObject.connected_arrows
          .sort((a, b) => (a[arrowFlowPropName] - b[arrowFlowPropName]));

        // compute color scales
        metadataObject.colorScale = scaleLinear()
          .domain(leafFlowExtent)
          .range(arrowScaleColorRange);

        return metadataObject;
      })
      .object(flowData);
  },
  (settings, state) => JSON.stringify(pick(state, [
    'arrowOriginPropName',
    'arrowDestinationPropName',
    'arrowFlowPropName',
    'arrowScaleColorRange',
    'isOriginFocused',
    'isCartogram',
  ])),
);

function getArrowPathFromDatumFunction(settings, state, arrowMetadata) {
  const {
    arrowOriginPropName,
    arrowDestinationPropName,
    arrowFlowPropName,
    arrowMidPointWeight,
    arrowScaleRangePixels,
    centroidLookup,
    destinationArrowPadding,
    flowData,
    geographyPropName,
    isOriginFocused,
    radiusAccessor,
  } = state;

  const flowSizeAccessor = d => Math.abs(d[arrowFlowPropName]);

  const arrowSize = scaleLinear()
    .domain(extent(flowData, flowSizeAccessor))
    .range(arrowScaleRangePixels);

  const dynamicOrigin = isOriginFocused ? arrowOriginPropName : arrowDestinationPropName;

  return function arrowPathFromDatum(datum) {
    const origin = new Victor(...centroidLookup[datum[arrowOriginPropName]]).clone();
    const destination = new Victor(...centroidLookup[datum[arrowDestinationPropName]]);

    // compute the vector origin -> destination, and get its length
    const vLength = destination.clone().subtract(origin).length();

    // get some distance along the length, weighted by arrowMidPointWeight
    const weightedLength = vLength * arrowMidPointWeight;

    // lookup the mean resultant vector from the origin (state),
    // and find the path midpoint by offsetting along the mean resultant by the weighted length
    const meanResultant = arrowMetadata[datum[dynamicOrigin]].mean;
    const vectorToMidPoint = meanResultant
      .clone()
      .multiply(new Victor(weightedLength, weightedLength));

    // this is the midpoint that adds some curve
    const mid = origin.clone().add(vectorToMidPoint);

    // offset the destination vector to avoid overlapping the destination bubble/label
    const halfRadius = radiusAccessor({
      [geographyPropName]: datum[arrowDestinationPropName], // look up by name of the destination
    }) * destinationArrowPadding;

    const displaceAwayFromDestination = mid.clone()
      .subtract(destination) // vector destination -> mid
      .normalize() // normalize to 1
      .multiply(new Victor(halfRadius, halfRadius)); // add the distance to displace away from the destination
    const correctedDestination = destination.clone()
      .add(displaceAwayFromDestination);

    // graduated stroke on a curved path function from:
    // @stuartathompson/standalone-function-for-a-graduated-stroke-on-a-curved-path
    return curvedPath([
      origin.toArray(),
      mid.toArray(),
      correctedDestination.toArray(),
    ], arrowSize(flowSizeAccessor(datum)));
  };
}

function getConnectedGeographiesCssSelector(state) {
  const {
    arrowOriginPropName: normalOrigin,
    arrowDestinationPropName: normalDestination,
    cssNameLookup,
    flowData,
    isOriginFocused,
  } = state;

  const focusProp = isOriginFocused ? normalOrigin : normalDestination;
  const otherProp = isOriginFocused ? normalDestination : normalOrigin;

  return nest()
    .key(d => d[focusProp])
    .rollup(leafFeatures => (
      leafFeatures.reduce((cssSelector, feature, index) => (
        index
          ? `${cssSelector},.${cssNameLookup[feature[otherProp]]}`
          : `.${cssNameLookup[feature[focusProp]]},\
              .${cssNameLookup[feature[otherProp]]}`
      ), '')
    ))
    .object(flowData);
}

export default function arrowAccessors(settings, state) {
  const arrowMetadata = getArrowMetadata(settings, state);
  return {
    arrowMetadata,
    arrowPathFunction: getArrowPathFromDatumFunction(settings, state, arrowMetadata),
    arrowConnectedGeographiesCssSeletor: getConnectedGeographiesCssSelector(state),
  };
}
