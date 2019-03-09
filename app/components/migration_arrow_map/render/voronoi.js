import { voronoi } from 'd3';

export default function drawVoronoi(selection, settings, state, selections) {
  const {
    topoJSONBaseWidth: width,
    topoJSONBaseHeight: height,
    transition: { duration },
  } = settings;
  const {
    arrowConnectedGeographiesCssSeletor,
    arrowDefaultOpacity,
    arrowHighlightOpacity,
    bubbleDefaultOpacity,
    bubbleHiddenOpacity,
    nodeData,
    nodeHoverState,
    cssNameLookup,
    isDisplayingVoronoi,
    geographyPropName,
    labelDefaultOpacity,
    xAccessor,
    yAccessor,
  } = state;
  const {
    arrows,
    bubbles,
    labels,
  } = selections;

  selection
    .selectAll('path')
    .remove();

  // voronoi
  const cells = voronoi()
    .x(xAccessor)
    .y(yAccessor)
    .extent([[-width / 2, -height / 2], [width * 1.5, height * 1.5]])
    .polygons(nodeData);

  const paths = selection
    .selectAll('path')
    .data(cells)
    .enter()
    .append('path')
    .attr('d', d => (`M${d.join('L')}Z`))
    .style('pointer-events', 'all')
    .style('fill', 'transparent')
    .style('opacity', 0);

  paths
    .transition()
    .duration(duration)
    .style('stroke', isDisplayingVoronoi ? 'gray' : 'transparent')
    .style('opacity', 1);

  if (nodeHoverState === 'HIGHLIGHT_CONNECTED') {
    paths
      .on('mouseover', (polygon) => {
        arrows.selectAll(`:not(.${cssNameLookup[polygon.data[geographyPropName]]})`)
          .transition()
          .duration(duration)
          .style('opacity', 0);
        arrows.selectAll(`.${cssNameLookup[polygon.data[geographyPropName]]}`)
          .transition()
          .duration(duration)
          .style('opacity', arrowHighlightOpacity);

        bubbles
          .selectAll('circle')
          .transition()
          .duration(duration)
          .style('opacity', bubbleHiddenOpacity);
        bubbles.selectAll(`${arrowConnectedGeographiesCssSeletor[polygon.data[geographyPropName]]}`)
          .transition()
          .duration(duration)
          .style('opacity', bubbleDefaultOpacity);

        labels.selectAll('*')
          .transition()
          .duration(duration)
          .style('opacity', bubbleHiddenOpacity);
        labels.selectAll(`${arrowConnectedGeographiesCssSeletor[polygon.data[geographyPropName]]}`)
          .transition()
          .duration(duration)
          .style('opacity', labelDefaultOpacity);
      })
      .on('mouseout', () => {
        bubbles.selectAll('circle')
          .transition()
          .duration(duration)
          .style('opacity', bubbleDefaultOpacity);
        labels.selectAll('*')
          .transition()
          .duration(duration)
          .style('opacity', labelDefaultOpacity);
        arrows.selectAll('*')
          .transition()
          .duration(duration)
          .style('opacity', arrowDefaultOpacity);
      });
  }
}
