import { select } from 'd3';

export default function renderSvg(parentNode, props) {
  const {
    css,
    topoJSONBaseWidth: width,
    topoJSONBaseHeight: height,
  } = props;

  const svg = select(parentNode).append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .classed(css.svgClass, true);

  return {
    parent: parentNode,
    svg,
    geography: svg.append('g').classed(css.groups.geography, true),
    arrows: svg.append('g').classed(css.groups.arrows, true),
    bubbles: svg.append('g').classed(css.groups.bubbles, true),
    voronoi: svg.append('g').classed(css.groups.voronoi, true),
    labels: svg.append('g').classed(css.groups.labels, true),
  };
}
