
export default function drawColorLegend(selections, settings, state) {
  const {
    colorLegend: selection,
  } = selections;
  const {
    colorLegendHtml,
    isDisplayingColorLegend,
  } = state;
  const {
    transition: { duration },
  } = settings;

  const join = selection
    .selectAll('div.color')
    .data(isDisplayingColorLegend ? [colorLegendHtml] : []);

  const enter = join
    .enter()
    .append('div')
    .classed('color', true)
    .style('opacity', 0);

  join
    .merge(enter)
    .html(d => d)
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
