export default function drawNodeLabels(selection, settings, state) {
  const {
    colorRadiusData,
    geographyClassAccessor,
    labelDefaultOpacity,
    labelPropName,
    xAccessor,
    yAccessor,
  } = state;
  const {
    transition: { duration },
  } = settings;

  const join = selection.selectAll('text')
    .data(colorRadiusData);

  const enter = join
    .enter()
    .append('text')
    .attr('class', geographyClassAccessor)
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .style('alignment-baseline', 'central')
    .style('text-anchor', 'middle')
    .style('fill', 'gray')
    .style('font-size', 14)
    .style('font-weight', 'bold')
    .style('font', 'Arial');

  join.merge(enter)
    .attr('transform', (datum) => {
      const x = xAccessor(datum);
      const y = yAccessor(datum);
      return `translate(${x},${y})`;
    })
    .text(datum => (datum[labelPropName] ? datum[labelPropName] : ''))
    .transition()
    .duration(duration)
    .style('opacity', labelDefaultOpacity);

  join
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
