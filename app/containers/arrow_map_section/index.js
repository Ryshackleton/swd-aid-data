import {
  extent, csv, json, max, scaleLinear,
} from 'd3';
import './data/narration.csv';
import './scss/arrow_map_section.scss';
import { formatAmt } from './utils/util';
import { createTooltipFromState } from './utils/tooltip';

import FlowArrowMap from '../../components/migration_arrow_map';

const viewStates = {
  geoNoColor: {
    bubbleDefaultOpacity: 0.9,
    labelDefaultOpacity: 0.9,
    isCartogram: false,
    isDisplayingArrows: false,
    isDisplayingColorLegend: true,
    isOriginFocused: true,
    bubbleRadiusPadding: 10,
    nodeHoverState: 'NONE',
  },
  geoArrowWebNoColor: {
    arrowDefaultOpacity: 0.2,
    bubbleDefaultOpacity: 0,
    labelDefaultOpacity: 0,
    isCartogram: false,
    isDisplayingArrows: true,
    isDisplayingColorLegend: false,
    isOriginFocused: true,
    bubbleRadiusPadding: 10,
    colorPropName: '',
    radiusPropName: 'net_donated',
    nodeHoverState: 'NONE',
  },
  geoArrowWebColor: {
    arrowDefaultOpacity: 0.2,
    bubbleDefaultOpacity: 0,
    labelDefaultOpacity: 0,
    isCartogram: false,
    isDisplayingArrows: true,
    isDisplayingColorLegend: true,
    colorPropName: 'recipient_positive_flow',
    isOriginFocused: true,
    bubbleRadiusPadding: 10,
    radiusPropName: 'net_donated',
    nodeHoverState: 'NONE',
  },
  geoNoArrowColor: {
    arrowDefaultOpacity: 0.2,
    bubbleDefaultOpacity: 0,
    labelDefaultOpacity: 0,
    isCartogram: false,
    isDisplayingArrows: false,
    isDisplayingColorLegend: true,
    colorPropName: 'recipient_positive_flow',
    isOriginFocused: true,
    bubbleRadiusPadding: 10,
    radiusPropName: 'net_donated',
    nodeHoverState: 'NONE',
  },
  cartoDonorColored: {
    arrowDefaultOpacity: 0.075,
    bubbleDefaultOpacity: 0.9,
    labelDefaultOpacity: 0.9,
    isCartogram: true,
    isDisplayingArrows: false,
    isDisplayingColorLegend: true,
    isOriginFocused: true,
    bubbleRadiusPadding: 10,
    radiusPropName: 'net_donated',
    nodeHoverState: 'NONE',
  },
  cartoRecipientColored: {
    arrowDefaultOpacity: 0.075,
    bubbleDefaultOpacity: 0.9,
    labelDefaultOpacity: 0.9,
    isCartogram: true,
    isDisplayingArrows: false,
    isDisplayingColorLegend: true,
    isOriginFocused: false,
    bubbleRadiusPadding: 3,
    radiusPropName: 'net_received',
    nodeHoverState: 'NONE',
  },
  cartoArrowRecipientColored: {
    arrowDefaultOpacity: 0.075,
    bubbleDefaultOpacity: 0.9,
    labelDefaultOpacity: 0.9,
    isCartogram: true,
    isDisplayingArrows: true,
    isDisplayingColorLegend: true,
    isOriginFocused: false,
    bubbleRadiusPadding: 3,
    radiusPropName: 'net_received',
    nodeHoverState: 'NONE',
  },
  cartoArrowDonorColored: {
    arrowDefaultOpacity: 0.075,
    bubbleDefaultOpacity: 0.9,
    labelDefaultOpacity: 0.9,
    isCartogram: true,
    isDisplayingArrows: true,
    isDisplayingColorLegend: true,
    isOriginFocused: true,
    bubbleRadiusPadding: 10,
    radiusPropName: 'net_donated',
    nodeHoverState: 'NONE',
  },
  cartoArrowDonorColorHotBuildConnected: {
    bubbleDefaultOpacity: 0.9,
    labelDefaultOpacity: 0.9,
    isCartogram: true,
    isDisplayingArrows: true,
    isDisplayingColorLegend: true,
    isOriginFocused: true,
    bubbleRadiusPadding: 10,
    radiusPropName: 'net_donated',
    nodeHoverState: 'HOT_BUILD_CONNECTED',
  },
  cartoArrowRecipientColorHotBuildConnected: {
    bubbleDefaultOpacity: 0.9,
    labelDefaultOpacity: 0.9,
    isCartogram: true,
    isDisplayingArrows: true,
    isDisplayingColorLegend: true,
    isOriginFocused: false,
    bubbleRadiusPadding: 3,
    radiusPropName: 'net_received',
    nodeHoverState: 'HOT_BUILD_CONNECTED',
  },
};

/** section configuration object with identifier, narration, and data (for the graph)  */
export default {
  sectionIdentifier: 'arrow_map_section',
  narration: 'app/containers/arrow_map_section/data/narration.csv',
  data: Promise.all([
    csv('app/containers/arrow_map_section/data/arrowData.csv'),
    csv('app/containers/arrow_map_section/data/nodeData.csv'),
    json('app/containers/arrow_map_section/data/world-topo-no-antarctica.json'),
  ]),

  convertTriggerToObject: true,

  /** optional function to reshape data after queries or parsing from a file */
  reshapeDataFunction:
    function reshapeData([arrowData, nodeData, topology]) {
      return {
        arrowData: arrowData.map(({
          donor_location_id,
          recipient_location_id,
          commitment_amount_usd_sum,
          ...rest
        }) => ({
          donor_location_id: Number(donor_location_id),
          recipient_location_id: Number(recipient_location_id),
          commitment_amount_usd_sum: Number(commitment_amount_usd_sum),
          ...rest,
        })),
        nodeData: nodeData.map(({
          loc_id, net_donated, net_received, recipient_positive_flow, ...rest
        }) => ({
          loc_id: Number(loc_id),
          net_donated: Number(net_donated),
          net_received: Number(net_received),
          recipient_positive_flow: Number(recipient_positive_flow),
          ...rest,
        })),
        topology,
      };
    },

  /**
   * Called AFTER data is fetched, and reshapeDataFunction is called.  This method should
   * build the graph and return an instance of that graph, which will passed as arguments
   * to the onScrollFunction and onActivateNarration functions.
   *
   * This function is called as follows:
   * buildGraphFunction(graphId, sectionConfig)
   * @param {string} graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
   * @param {object} sectionConfig - the configuration object passed to ScrollyTeller
   * @param {string} [sectionConfig.sectionIdentifier] - the identifier for this section
   * @param {object} [sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
   * @param {object} [sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
   * @param {object} [sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
   * @param {object} [sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
   * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
   * @returns {object} - chart instance
   */
  buildGraphFunction: function buildGraph(
    graphId,
    { data: { topology, arrowData, nodeData } },
  ) {
    const extentOfAllDonations = extent(nodeData, d => Number(d.recipient_positive_flow));
    const maxDonationOrReceipt = max(extentOfAllDonations, d => Math.abs(d));
    return new FlowArrowMap(
      `#${graphId}`, // container selector
      { // props
        topology,
        featureSets: ['admin0'],
        topojsonLocationPropName: 'loc_id',
        topoJSONBaseWidth: 1000, // width scaling associated with the topojson
        topoJSONBaseHeight: 520, // width scaling associated with the topojson
        transition: { duration: 700 },
        viewBoxXPan: 0,
        viewBoxYPan: -50,
        chartState: { // initial state
          // chart view states
          isCartogram: false,
          isDisplayingVoronoi: false,
          isDisplayingArrows: false,
          isOriginFocused: true,
          isDisplayingColorLegend: true,
          nodeHoverState: 'NONE', // | HIGHLIGHT_CONNECTED

          // node data array
          nodeData,
          geographyPropName: 'loc_id',
          // make a color scale where zero donations/receipts are in the middle of the scale
          colorScale: scaleLinear().domain([-maxDonationOrReceipt, maxDonationOrReceipt]),
          radiusRange: [10, 40],
          colorPropName: 'recipient_positive_flow',
          radiusPropName: 'net_donated', // flip to net_received to make receiver bubbles bigger

          // bubble styles
          bubbleDefaultOpacity: 0.9,
          bubbleHiddenOpacity: 0.15,
          bubbleRadiusPadding: 10,
          // label styles
          labelDefaultOpacity: 0.9,
          labelPropName: 'map_id',
          labelLongName: 'short_name',
          // color legend
          colorLegendTitle: '<span>Net <span style="color:#67001E;"><strong>donated</strong></span> or \
                             <span style="color:#052F61;"><strong>received</strong></span> \
                             in Billions from 1973-2013</span>',
          legendTickFormatFunction: formatAmt, // format to zero precision

          // flow data array
          flowData: arrowData,
          arrowDefaultOpacity: 0.075,
          arrowOriginPropName: 'donor_location_id',
          arrowDestinationPropName: 'recipient_location_id',
          arrowFlowPropName: 'commitment_amount_usd_sum',
          arrowOriginLabelProp: 'donor',
          arrowDestnationLabelProp: 'recipient',
          arrowHighlightOpacity: 0.9,
          arrowMidPointWeight: 0.4, // controls curvature of arrows 0 straight, 1 curved
          arrowScaleRangePixels: [10, 50],
          arrowScaleColorRange: ['lightgrey', '#333333'],
          destinationArrowPadding: 0.75,

          // tooltip creator using tippy.js
          createTooltipFromState,

          // starting state
          ...viewStates.geoArrowWebNoColor,
        },
      },
    );
  },

  /**
   * Called upon scrolling of the section. See argument list below, this function is called as:
   * onScrollFunction({ index, progress, element, graphId, sectionConfig, trigger })
   * @param {object} [params] - object containing parameters
   * @param {number} [params.index] - index of the active narration object
   * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
   * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
   * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
   * @param {string} [params.graphContainerId] - id of the graph container in this section. const graphContainer = d3.select(`#${graphContainerId}`);
   * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
   * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
   * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
   * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
   * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
   * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
   * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
   * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
   * @returns {void}
   */
  onScrollFunction: function onScroll({ state, graphId, graphContainerId }) {
  },

  /**
   * Called when a narration block is activated.
   * See argument list below, this function is called as:
   * onActivateNarration({ index, progress, element, trigger, graphId, sectionConfig })
   * @param {object} [params] - object containing parameters
   * @param {number} [params.index] - index of the active narration object
   * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
   * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
   * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
   * @param {string} [params.direction] - the direction the event happened in (up or down)
   * @param {string} [params.graphContainerId] - id of the graph container in this section. const graphContainer = d3.select(`#${graphContainerId}`);
   * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
   * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
   * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
   * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
   * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
   * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
   * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
   * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
   * @returns {void}
   */
  onActivateNarrationFunction: function onActivateNarration(
    {
      state: {
        viewState,
      },
      sectionConfig: { graph },
    },
  ) {
    if (viewState && viewStates[viewState]) {
      graph.update({ chartState: viewStates[viewState] });
    }
  },
};
