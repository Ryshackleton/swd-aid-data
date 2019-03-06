export default {
  // chart view states
  isCartogram: false,
  isDisplayingVoronoi: true,
  isDisplayingArrows: true,

  bubbleDefaultOpacity: 0.9,
  bubbleHiddenOpacity: 0.15,

  // color data array
  colorRadiusData: [], // pick from props
  geographyPropName: 'state',
  colorPropName: 'Percent Change',

  // flow data array
  flowData: [], // pick from props
  arrowOriginPropName: 'Origin',
  arrowDestinationPropName: 'Destination',
  arrowDefaultOpacity: 0.075,
  arrowFlowPropName: 'Total',
  arrowHighlightOpacity: 0.85,
  arrowMidPointWeight: 0.4, // controls curvature of arrows 0 straight, 1 curved
  arrowScaleRangePixels: [10, 40],
  arrowScaleColorRange: ['lightgrey', '#333333'],
  destinationArrowPadding: 0.75,
  isOriginFocused: true,

  // labels
  labelDefaultOpacity: 0.9,
  labelPropName: 'map_id',
};
