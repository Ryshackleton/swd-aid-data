import quantizeColorScaleFactory from '../utils/color';

export default function drawColorLegend(selection, settings, state) {
  const {
    colorScale,
  } = state;
  const {
    transition: { duration },
  } = settings;

  const join = selection
    .selectAll('div.color')
    .data([colorScale]);

  const enter = join
    .enter()
    .append('div')
    .classed('color', true)
    .style('opacity', 0);

  join
    .merge(enter)
    .html((scaleFunction) => {
      const { legend } = quantizeColorScaleFactory(
        scaleFunction,
        5,
        'interpolateRdBu',
        800,
        30,
        '$,.0f',
      );
      return legend;
    })
    .transition()
    .duration(duration)
    .style('opacity', 1);

  join
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
