export default function drawBubbles(selection, props, state) {
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
  } = props;
  const bubbles = selection
    .selectAll('circle')
    .data(isCartogram ? colorRadiusData : []);

  const enter = bubbles
    .enter()
    .append('circle')
    .attr('class', geographyClassAccessor)
    .style('stroke', 'lightgray')
    .style('stroke-width', '1px')
    .style('opacity', 0)
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
    .remove();
}
