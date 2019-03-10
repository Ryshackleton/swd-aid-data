import { select } from 'd3';

export default function renderSvg(parentNode, settings) {
  const {
    css,
    topoJSONBaseWidth: width,
    topoJSONBaseHeight: height,
    viewBoxXPan = 0,
    viewBoxYPan = 0,
  } = settings;

  const parent = select(parentNode);
  const svg = parent.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `${viewBoxXPan} ${viewBoxYPan} ${width} ${height}`)
    .classed(css.svgClass, true);

  return {
    parent,
    svg,
    colorLegend: parent.append('div').classed(css.groups.colorLegend, true),
    arrowLegend: parent.append('div').classed(css.groups.arrowLegend, true),
    geography: svg.append('g').classed(css.groups.geography, true),
    arrows: svg.append('g').classed(css.groups.arrows, true),
    bubbles: svg.append('g').classed(css.groups.bubbles, true),
    voronoi: svg.append('g').classed(css.groups.voronoi, true),
    labels: svg.append('g').classed(css.groups.labels, true),
  };
}
