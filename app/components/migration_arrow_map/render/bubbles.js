import { identity } from 'lodash';

export default function drawBubbles(selection, settings, state) {
  const {
    isCartogram,
    createTooltipFromState = identity,
    nodeData,
    bubbleDefaultOpacity,
    xAccessor,
    yAccessor,
    radiusAccessor,
    colorAccessor,
    geographyClassAccessor,
  } = state;
  const {
    transition: { duration },
    css: { groups: { bubbles: bubblesSelector } },
  } = settings;

  const makeTooltipForDatum = createTooltipFromState(state, `.${bubblesSelector}`);

  const bubbles = selection
    .selectAll('circle')
    .data(isCartogram ? nodeData : []);

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
    .each(makeTooltipForDatum)
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
