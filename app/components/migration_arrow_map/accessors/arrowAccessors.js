import Victor from 'victor';
// eslint-disable-next-line import/no-extraneous-dependencies
import { extent, nest, scaleLinear } from 'd3';
import curvedPath from '../lib/curvedPath';

// TODO: weight these vectors by flow?
function getMeanResultantVectorLookup(settings, state, centroidLookup) {
  const {
    arrowOriginPropName,
    arrowDestinationPropName,
    flowData,
  } = state;

  return nest()
    .key(d => d[arrowOriginPropName])
    .rollup((all) => {
      // Victor.js - note that these Victor functions ALWAYS mutate unless the Victor is cloned
      const mean = new Victor(0,0);
      all.forEach((flowArrow) => {
        const origin = new Victor(...centroidLookup[flowArrow[arrowOriginPropName]]);
        const destination = new Victor(...centroidLookup[flowArrow[arrowDestinationPropName]]);
        mean.add(destination.clone().subtract(origin));
      });
      mean.normalize();
      return mean;
    })
    .object(flowData);
}

function getArrowColorScalesForEachNode(settings, state) {
  const {
    arrowOriginPropName,
    arrowDestinationPropName,
    arrowFlowPropName,
    arrowScaleColorRange,
    flowData,
    isOriginFocused,
  } = state;

  return nest()
    .key(d => (isOriginFocused ? d[arrowOriginPropName] : d[arrowDestinationPropName]))
    .rollup(all => (
      scaleLinear()
        .domain(extent(all, d => Math.abs(d[arrowFlowPropName])))
        .range(arrowScaleColorRange)
    ))
    .object(flowData);
}

function getArrowPathFromDatumFunction(settings, state) {
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
    radiusAccessor,
  } = state;

  const flowSizeAccessor = d => Math.abs(d[arrowFlowPropName]);

  const arrowSize = scaleLinear()
    .domain(extent(flowData, flowSizeAccessor))
    .range(arrowScaleRangePixels)

  const meanResultantVectorLookup = getMeanResultantVectorLookup(settings, state, centroidLookup);

  return function arrowPathFromDatum(datum) {
    const origin = new Victor(...centroidLookup[datum[arrowOriginPropName]]).clone();
    const destination = new Victor(...centroidLookup[datum[arrowDestinationPropName]]);

    // compute the vector origin -> destination, and get its length
    const vLength = destination
      .clone()
      .subtract(origin)
      .length();

    // get some distance along the length, weighted by arrowMidPointWeight
    const weightedLength = vLength * arrowMidPointWeight;

    // lookup the mean resultant vector from the origin (state),
    // and find the path midpoint by offsetting along the mean resultant by the weighted length
    const vectorToMidPoint = meanResultantVectorLookup[datum[arrowOriginPropName]]
      .clone()
      .multiply(new Victor(weightedLength, weightedLength));

    // this is the midpoint that adds some curve
    const mid = origin.clone()
      .add(vectorToMidPoint);

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
  return {
    arrowPathFunction: getArrowPathFromDatumFunction(settings, state),
    arrowScalesForNodes: getArrowColorScalesForEachNode(settings, state),
    arrowConnectedGeographiesCssSeletor: getConnectedGeographiesCssSelector(state),
  };
}
