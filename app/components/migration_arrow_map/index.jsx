import D3Component from 'idyll-d3-component';
import { pick } from 'lodash';
import renderSvg from './render/svg';
import { buildAccessors } from './accessors/buildAccessors';
import drawBubbles from './render/bubbles';
import drawGeography from './render/geography';
import drawVoronoi from './render/voronoi';

import { defaultProps, propKeys } from './props';
import { state, stateKeys } from './state';

import './flowArrowMap.scss';

export default class FlowArrowMap extends D3Component {
  initialize(node, props) {
    this.state = { ...state, ...pick(props, stateKeys), ...props.chartState };
    this.props = { ...defaultProps, ...pick(props, propKeys) };

    this.selections = renderSvg(node, this.props, this.state);

    this.update(props);
  }

  update(props, oldProps) {
    if (!props.chartState) {
      return;
    }
    this.state = { ...this.state, ...props.chartState };
    this.state = { ...this.state, ...buildAccessors(this.props, this.state) };

    drawBubbles(this.selections.bubbles, this.props, this.state);
    drawGeography(this.selections.geography, this.props, this.state);
    drawVoronoi(this.selections.voronoi, this.props, this.state); // arrows, bubbles, stateLabels)

  //     drawArrows(arrows);
  // isCartogram
  //   ? bubbleDrawFunction(bubbles, svg)
  //   : drawStates(states);
  // drawStateLabels(stateLabels);
  }
}
