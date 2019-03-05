export default function drawBubbles(selection, settings, state) {
  const {
    isCartogram,
    colorRadiusData,
    bubbleDefaultOpacity,
    xAccessor,
    yAccessor,
    radiusAccessor,
    colorAccessor,
    geographyClassAccessor,
  } = state;
  const {
    transition: { duration },
  } = settings;
  const bubbles = selection
    .selectAll('circle')
    .data(isCartogram ? colorRadiusData : []);

  const enter = bubbles
    .enter()
    .append('circle')
    .attr('class', geographyClassAccessor)
    .style('opacity', 0)
    .style('stroke', 'lightgray')
    .style('stroke-width', '1px')
    .attr('cx', xAccessor)
    .attr('cy', yAccessor);

  bubbles
    .merge(enter)
    .transition()
    .duration(duration)
    .attr('cx', xAccessor)
    .attr('cy', yAccessor)
    .attr('r', radiusAccessor)
    .style('fill', colorAccessor)
    .style('opacity', bubbleDefaultOpacity);

  bubbles
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
