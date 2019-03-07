
export default function drawGeography(selection, settings, state) {
  const {
    bubbleDefaultOpacity,
    features,
    path,
    topojsonLocationPropName,
    transition: { duration },
  } = settings;
  const {
    isCartogram,
    colorAccessor,
    geographyClassAccessor,
  } = state;

  const paths = selection
    .selectAll('path')
    .data(
      isCartogram ? [] : features,
      datum => (datum.properties[topojsonLocationPropName]),
    );

  const enter = paths
    .enter()
    .append('path')
    .attr('class', geographyClassAccessor)
    .attr('d', path)
    .style('fill', d => (colorAccessor(d) || 'transparent'))
    .style('stroke', 'gray')
    .style('stroke-width', '0.25px')
    .style('opacity', 0);

  paths
    .merge(enter)
    .transition()
    .duration(duration)
    .style('opacity', bubbleDefaultOpacity)
    .style('fill', d => (colorAccessor(d) || 'transparent'));

  paths
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
