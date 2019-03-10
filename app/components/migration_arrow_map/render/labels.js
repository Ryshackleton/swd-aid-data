import chroma from 'chroma-js';

export default function drawNodeLabels(selection, settings, state) {
  const {
    colorAccessor,
    nodeData,
    fontSize = 14,
    geographyClassAccessor,
    isCartogram,
    labelDefaultOpacity,
    labelPropName,
    radiusAccessor,
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

  const getTransform = (datum) => {
    const innerDiameter = 1.5 * radiusAccessor(datum);
    const scale = (innerDiameter < fontSize)
      ? innerDiameter / fontSize
      : 1;
    const x = xAccessor(datum);
    const y = yAccessor(datum);
    return `translate(${x},${y})scale(${scale})`;
  };

  const enter = join
    .enter()
    .append('text')
    .attr('class', geographyClassAccessor)
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .style('alignment-baseline', 'central')
    .style('text-anchor', 'middle')
    .style('font-size', fontSize)
    .style('font-weight', 'bold')
    .style('font', 'Arial')
    .style('fill', getOppositeColor)
    .attr('transform', getTransform);

  join.merge(enter)
    .text(datum => (datum[labelPropName] ? datum[labelPropName] : ''))
    .transition()
    .duration(duration)
    .style('fill', getOppositeColor)
    .attr('transform', getTransform)
    .style('opacity', labelDefaultOpacity);

  join
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
