import { pick } from 'lodash';
import renderSvg from './render/svg';
import buildAccessors from './accessors/buildAccessors';
import drawArrows from './render/arrows';
import drawBubbles from './render/bubbles';
import drawGeography from './render/geography';
import drawColorLegend from './render/colorLegend';
import drawNodeLabels from './render/labels';
import drawVoronoi from './render/voronoi';
import { getFeatureArray } from './utils/utils';

import { defaultSettings, settingsKeys } from './settings';
import defaultState from './state';

import './flowArrowMap.scss';

export default class FlowArrowMap {
  constructor(node, settings) {
    this.draw = this.draw.bind(this);

    this.settings = { ...defaultSettings, ...pick(settings, settingsKeys) };

    this.settings.features = getFeatureArray(this.settings);

    this.selections = renderSvg(node, this.settings);

    this.update(settings);
  }

  setState(newState, done) {
    this.state = newState;
    done();
  }

  draw() {
    drawBubbles(this.selections.bubbles, this.settings, this.state);
    drawGeography(this.selections.geography, this.settings, this.state);
    drawNodeLabels(this.selections.labels, this.settings, this.state);
    drawColorLegend(this.selections.colorLegend, this.settings, this.state);
    drawVoronoi(this.selections.voronoi, this.settings, this.state, this.selections);
    drawArrows(this.selections.arrows, this.settings, this.state);
  }

  update(props) {
    if (!props.chartState) {
      return;
    }

    const newState = { ...defaultState, ...this.state, ...props.chartState };
    this.setState(buildAccessors(this.settings, newState), this.draw);
  }
}
