import { voronoi } from 'd3';

export default function drawVoronoi(selection, settings, state) {
  const {
    topoJSONBaseWidth: width,
    topoJSONBaseHeight: height,
    transition: { duration },
  } = settings;
  const {
    colorRadiusData,
    isDisplayingVoronoi,
    xAccessor,
    yAccessor,
  } = state;

  // always rebuild voronoi
  selection.selectAll('path')
    .remove();

  // voronoi
  const cells = voronoi()
    .x(xAccessor)
    .y(yAccessor)
    .extent([[0, 0], [width, height]])
    .polygons(colorRadiusData);

  selection
    .selectAll('path')
    .data(cells)
    .enter()
    .append('path')
    .attr('d', d => (`M${d.join('L')}Z`))
    .style('pointer-events', 'all')
    .style('fill', 'transparent')
    .style('opacity', 0)
    .transition()
    .duration(duration)
    .style('stroke', isDisplayingVoronoi ? 'gray' : 'transparent')
    .style('opacity', 1);

  //   .on('mouseover', (polygon) => {
  //     arrowGroup.selectAll(`:not(.${cssNameLookup[polygon.data.state]})`)
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', 0);
  //     arrowGroup.selectAll(`.${cssNameLookup[polygon.data.state]}`)
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', arrowHighlightOpacity);
  //
  //     bubbleGroup
  //       .selectAll('circle')
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', bubbleHiddenOpacity);
  //     bubbleGroup.selectAll(`${connectedStatesLookup[polygon.data.state]}`)
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', bubbleDefaultOpacity);
  //
  //     labelGroup.selectAll('*')
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', bubbleHiddenOpacity);
  //     labelGroup.selectAll(`${connectedStatesLookup[polygon.data.state]}`)
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', labelDefaultOpacity);
  // })
  //   .on('mouseout', () => {
  //     bubbleGroup.selectAll('circle')
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', bubbleDefaultOpacity);
  //     labelGroup.selectAll('*')
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', labelDefaultOpacity);
  //     arrowGroup.selectAll(`*`)
  //       .transition()
  //       .duration(duration)
  //       .style('opacity', arrowDefaultOpacity);
  // });
}
