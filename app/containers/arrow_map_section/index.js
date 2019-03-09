import { json } from 'd3';
import './data/narration.csv';
import './scss/arrow_map_section.scss';
import FlowArrowMap from '../../components/migration_arrow_map';

/** section configuration object with identifier, narration, and data (for the graph)  */
export default {
  sectionIdentifier: 'arrow_map_section',
  narration: 'app/containers/arrow_map_section/data/narration.csv',
  data: Promise.all([
    json('app/containers/arrow_map_section/data/arrowData.json'),
    json('app/containers/arrow_map_section/data/nodeData.json'),
    json('app/containers/arrow_map_section/data/world-topo-no-antarctica.json'),
  ]),

  convertTriggerToObject: true,

  /** optional function to reshape data after queries or parsing from a file */
  reshapeDataFunction:
    function reshapeData([arrowData, nodeData, topology]) {
      return { arrowData, nodeData, topology };
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
    return new FlowArrowMap(
      `#${graphId}`,
      {
        topology,
        featureSets: ['admin0'],
        topojsonLocationPropName: 'loc_id',
        topoJSONBaseWidth: 1000, // width scaling associated with the topojson
        topoJSONBaseHeight: 520, // width scaling associated with the topojson
        transition: { duration: 700 },
        viewBoxXPan: 0,
        viewBoxYPan: -50,
        chartState: {
          // chart view states
          isCartogram: false,
          isDisplayingVoronoi: false,
          isDisplayingArrows: false,
          isOriginFocused: true,
          nodeHoverState: 'NONE', // | HIGHLIGHT_CONNECTED

          // color data array
          nodeData,
          geographyPropName: 'location_id',
          d3ColorScaleName: 'scaleLinear',
          colorRange: ['#fff', '#5f98ce'],
          radiusRange: [15, 50],

          // flow data array
          flowData: arrowData,
          arrowDefaultOpacity: 0.075,
          arrowOriginPropName: 'donor_location_id',
          arrowDestinationPropName: 'recipient_location_id',
          arrowFlowPropName: 'total_donation',
          colorPropName: 'total_donated', // 'total_received', when destination focused
          arrowHighlightOpacity: 0.95,
          arrowMidPointWeight: 0.4, // controls curvature of arrows 0 straight, 1 curved
          arrowScaleRangePixels: [10, 40],
          arrowScaleColorRange: ['lightgrey', '#333333'],
          destinationArrowPadding: 0.75,

          // labels
          labelDefaultOpacity: 0.9,
          labelPropName: 'map_id',
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
        chartState = {},
      },
      sectionConfig: { graph },
    },
  ) {
    if (chartState.colorRange) {
      graph.update({ chartState: { ...chartState, colorRange: chartState.colorRange.split('|') } });
    } else {
      graph.update({ chartState });
    }
  },
};
