export const state = {
  // chart view states
  isCartogram: false,
  isDisplayingVoronoi: true,

  // color data array
  colorRadiusData: [], // pick from props
  geographyPropName: 'state',

  // flow data array
  flowData: [], // pick from props
  arrowOriginPropName: 'Origin',
  arrowDestinationPropName: 'Destination',
  colorPropName: 'Percent Change',
};
export const stateKeys = Object.keys(state);
