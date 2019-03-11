// import { cleanCssName } from '../utils/utils';

export default function drawArrows(selection, settings, state) {
  const {
    arrowMetadata,
    arrowDefaultOpacity,
    arrowDestinationPropName,
    arrowFlowPropName,
    arrowOriginPropName,
    arrowPathFunction,
    flowData,
    isDisplayingArrows,
    isOriginFocused,
    nodeHoverState,
  } = state;

  const dynamicOrigin = isOriginFocused
    ? arrowOriginPropName
    : arrowDestinationPropName;

  const join = selection
    .selectAll('path')
    .data(!isDisplayingArrows || nodeHoverState === 'HOT_BUILD_CONNECTED' ? [] : flowData);

  const enter = join
    .enter()
    .append('path')
    // .attr('class', datum => cleanCssName(datum[dynamicOrigin]))
    .style('pointer-events', 'none')
    .attr('stroke', 'lightgray')
    .style('stroke-width', '0.5px')
    .attr('opacity', arrowDefaultOpacity);

  join.merge(enter)
    .attr('fill', (datum) => {
      // lookup color scale from node name
      const { colorScale } = arrowMetadata[datum[dynamicOrigin]];
      return colorScale(Math.abs(datum[arrowFlowPropName]));
    })
    .attr('d', arrowPathFunction);

  join
    .exit()
    .remove();
}
