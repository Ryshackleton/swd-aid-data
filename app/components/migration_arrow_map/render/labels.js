import chroma from 'chroma-js';

export default function drawNodeLabels(selection, settings, state) {
  const {
    colorAccessor,
    nodeData,
    geographyClassAccessor,
    isCartogram,
    labelDefaultOpacity,
    labelPropName,
    xAccessor,
    yAccessor,
  } = state;
  const {
    transition: { duration },
  } = settings;

  const join = selection.selectAll('text')
    .data(nodeData);

  const getOppositeColor = (d) => {
    if (!isCartogram) {
      return 'transparent';
    }
    const color = colorAccessor(d);
    return chroma(color).luminance() < 0.5
      ? chroma(color).brighten(2)
      : chroma(color).darken(2);
  };

  const enter = join
    .enter()
    .append('text')
    .attr('class', geographyClassAccessor)
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .style('alignment-baseline', 'central')
    .style('text-anchor', 'middle')
    .style('fill', getOppositeColor)
    .style('font-size', 14)
    .style('font-weight', 'bold')
    .style('font', 'Arial')
    .attr('transform', (datum) => {
      const x = xAccessor(datum);
      const y = yAccessor(datum);
      return `translate(${x},${y})`;
    });

  join.merge(enter)
    .text(datum => (datum[labelPropName] ? datum[labelPropName] : ''))
    .transition()
    .duration(duration)
    .style('fill', getOppositeColor)
    .attr('transform', (datum) => {
      const x = xAccessor(datum);
      const y = yAccessor(datum);
      return `translate(${x},${y})`;
    })
    .style('opacity', labelDefaultOpacity);

  join
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
