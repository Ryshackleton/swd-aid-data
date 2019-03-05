import { cleanCssName } from '../utils/utils';

export default function drawArrows(selection, settings, state) {
  const {
    arrowDefaultOpacity,
    arrowDestinationPropName,
    arrowFlowPropName,
    arrowOriginPropName,
    arrowPathFunction,
    arrowScalesForNodes,
    flowData,
    isDisplayingArrows,
    isFlowingOriginToDestination,
  } = state;
  const { transition: { duration } } = settings;

  const dynamicOrigin = isFlowingOriginToDestination
    ? arrowOriginPropName
    : arrowDestinationPropName;

  selection.selectAll('path')
    .remove();

  const join = selection
    .selectAll('path')
    .data(isDisplayingArrows ? flowData : []);

  const enter = join
    .enter()
    .append('path')
    .attr('class', datum => cleanCssName(datum[dynamicOrigin]))
    // .style('opacity', 0)
    .style('pointer-events', 'none')
    .attr('stroke', 'lightgray')
    .style('stroke-width', '0.5px');

  join.merge(enter)
    .transition()
    .duration(duration)
    .attr('d', arrowPathFunction)
    .attr('opacity', arrowDefaultOpacity)
    .attr('fill', (datum) => {
      // lookup color scale from node name
      const colorScale = arrowScalesForNodes[datum[dynamicOrigin]];
      return colorScale(Math.abs(datum[arrowFlowPropName]));
    });

  join
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
