export default {
  // chart view states
  isCartogram: false,
  isDisplayingVoronoi: true,
  isDisplayingArrows: true,

  bubbleDefaultOpacity: 0.9,
  bubbleHiddenOpacity: 0.15,
  bubbleRadiusPadding: 3,

  // all node data
  nodeData: [], // pick from props
  // geography
  geographyPropName: 'location_id',
  // color data array
  colorPropName: 'colorProp',
  // radius
  radiusPropName: 'radiusProp',

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
  labelLongName: 'short_name',
};
