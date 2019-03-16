import { select } from 'd3';

export default function renderSvg(parentNode, settings) {
  const { css } = settings;
  const parent = select(parentNode);

  const geography = parent
    .append('canvas').classed(css.groups.geography, true)
    .style('position', 'absolute')
    .style('top', 0)
    .style('pointer-events', 'none');
  const arrows = parent
    .append('canvas').classed(css.groups.arrows, true)
    .style('position', 'absolute')
    .style('top', 0)
    .style('pointer-events', 'none');
  const svg = parent.append('svg')
    .attr('width', '100%')
    .classed(css.svgClass, true);

  return {
    parent,
    svg,
    arrows,
    arrowsCtx: arrows.node().getContext('2d'),
    geography,
    geographyCtx: geography.node().getContext('2d'),
    geographyJoin: svg.append('g'),
    arrowsJoin: svg.append('g'),
    arrowsSelect: svg.append('g').classed(css.groups.arrowsSelect, true),
    bubbles: svg.append('g').classed(css.groups.bubbles, true),
    voronoi: svg.append('g').classed(css.groups.voronoi, true),
    labels: svg.append('g').classed(css.groups.labels, true),
    colorLegend: parent.append('div').classed(css.groups.colorLegend, true),
    arrowLegend: parent.append('div').classed(css.groups.arrowLegend, true),
  };
}
