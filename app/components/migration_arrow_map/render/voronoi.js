import { voronoi } from 'd3';

export default function drawVoronoi(selection, props, state) {
  const {
    topoJSONBaseWidth: width,
    topoJSONBaseHeight: height,
  } = props;
  const {
    colorRadiusData,
    isDisplayingVoronoi,
    xAccessor,
    yAccessor,
    geographyClassAccessor,
  } = state;

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
    .style('pointer-events', 'all')
    .style('stroke', isDisplayingVoronoi ? 'gray' : 'transparent')
    .style('fill', 'transparent')
    .attr('d', d => (`M${d.join('L')}Z`));

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
