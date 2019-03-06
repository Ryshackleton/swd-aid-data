import D3Component from 'idyll-d3-component';
import { pick } from 'lodash';
import renderSvg from './render/svg';
import buildAccessors from './accessors/buildAccessors';
import drawArrows from './render/arrows';
import drawBubbles from './render/bubbles';
import drawGeography from './render/geography';
import drawNodeLabels from './render/labels';
import drawVoronoi from './render/voronoi';

import { defaultSettings, settingsKeys } from './settings';
import defaultState from './state';

import './flowArrowMap.scss';

export default class FlowArrowMap extends D3Component {
  initialize(node, props) {
    this.settings = { ...defaultSettings, ...pick(props, settingsKeys) };

    this.selections = renderSvg(node, this.settings);

    this.update(props);
  }

  update(props /* , oldProps */) {
    if (!props.chartState) {
      return;
    }
    this.setState({
      ...defaultState,
      ...props.chartState,
      ...buildAccessors(this.settings, { ...defaultState, ...props.chartState }),
    }, () => {
      drawBubbles(this.selections.bubbles, this.settings, this.state);
      drawGeography(this.selections.geography, this.settings, this.state);
      drawVoronoi(this.selections.voronoi, this.settings, this.state, this.selections);
      drawArrows(this.selections.arrows, this.settings, this.state);
      drawNodeLabels(this.selections.labels, this.settings, this.state);
    });
  }
}
