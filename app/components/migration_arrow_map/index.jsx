import D3Component from 'idyll-d3-component';
import { pick } from 'lodash';
import renderSvg from './render/svg';
import { buildAccessors } from './accessors/buildAccessors';
import drawBubbles from './render/bubbles';
import drawGeography from './render/geography';
import drawVoronoi from './render/voronoi';

import { defaultSettings, settingsKeys } from './settings';
import { state as defaultState } from './state';

import './flowArrowMap.scss';

export default class FlowArrowMap extends D3Component {
  initialize(node, props) {
    this.settings = { ...defaultSettings, ...pick(props, settingsKeys) };

    this.selections = renderSvg(node, this.settings);

    this.update(props);
  }

  update(props, oldProps) {
    if (!props.chartState) {
      return;
    }
    this.setState({
      ...defaultState,
      ...props.chartState,
      ...buildAccessors(this.settings, props.chartState),
    }, () => {
      drawBubbles(this.selections.bubbles, this.settings, this.state);
      drawGeography(this.selections.geography, this.settings, this.state);
      drawVoronoi(this.selections.voronoi, this.settings, this.state); // arrows, bubbles, stateLabels)
    });

  //     drawArrows(arrows);
  // isCartogram
  //   ? bubbleDrawFunction(bubbles, svg)
  //   : drawStates(states);
  // drawStateLabels(stateLabels);
  }
}
