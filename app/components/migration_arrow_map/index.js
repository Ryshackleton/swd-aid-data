/* global window */
import { pick } from 'lodash';
import renderSvg from './render/svg';
import buildAccessors from './accessors/buildAccessors';
import drawArrows from './render/arrows';
import drawArrowsSelected from './render/arrowsSelect';
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

    this.resize(false);
    this.update(settings);
  }

  setState(newState, done) {
    this.state = newState;
    done();
  }

  draw() {
    drawBubbles(this.selections, this.settings, this.state);
    drawGeography(this.selections, this.settings, this.state);
    drawNodeLabels(this.selections, this.settings, this.state);
    drawColorLegend(this.selections, this.settings, this.state);
    drawVoronoi(this.selections, this.settings, this.state);
    drawArrows(this.selections, this.settings, this.state);
    drawArrowsSelected(this.selections, this.settings, this.state);
  }

  update(props) {
    if (!props.chartState) {
      return;
    }

    const newState = { ...defaultState, ...this.state, ...props.chartState };
    this.setState(buildAccessors(this.settings, newState), this.draw);
  }

  resize(update = true) {
    const {
      topoJSONBaseWidth: width,
      topoJSONBaseHeight: height,
      viewBoxXPan = 0,
      viewBoxYPan = 0,
    } = this.settings;

    const {
      width: parentWidth,
    } = this.selections.parent.node().getBoundingClientRect();

    const {
      height: svgHeight,
      width: svgWidth,
    } = this.selections.svg.node().getBoundingClientRect();

    const pixelRatio = window.devicePixelRatio || 1;
    const scaleX = svgWidth / width * pixelRatio;
    const scaleY = svgHeight / height * pixelRatio;

    this.selections.svg
      .attr('viewBox', `${viewBoxXPan} ${viewBoxYPan} ${width} ${height}`);

    this.selections.geography
      .attr('width', parentWidth * pixelRatio) // canvas width & height * pixel ratio (usually 2)
      .attr('height', svgHeight * pixelRatio)
      .style('width', `${parentWidth}px`) // css width & height to scale canvas back down
      .style('height', `${svgHeight}px`)
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('pointer-events', 'none');

    this.selections.geographyCtx.scale(scaleX, scaleY);
    this.selections.geographyCtx.translate(-viewBoxXPan, -viewBoxYPan);

    this.selections.arrows
      .attr('width', parentWidth * pixelRatio) // canvas width & height * pixel ratio (usually 2)
      .attr('height', svgHeight * pixelRatio)
      .style('width', `${parentWidth}px`) // css width & height to scale canvas back down
      .style('height', `${svgHeight}px`)
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('pointer-events', 'none');
    this.selections.arrowsCtx.scale(scaleX, scaleY);
    this.selections.arrowsCtx.translate(-viewBoxXPan, -viewBoxYPan);

    if (update) {
      this.update({ chartState: {} });
    }
  }
}
