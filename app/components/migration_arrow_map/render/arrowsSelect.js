import { get } from 'lodash';
import { cleanCssName } from '../utils/utils';

export function highlightNodeFunction(arrows, bubbles, labels, state) {
  const {
    arrowOriginPropName,
    arrowDestinationPropName,
    arrowFlowPropName,
    arrowHighlightOpacity,
    arrowPathFunction,
    geographyPropName,
    arrowMetadata,
    bubbleHiddenOpacity,
    isOriginFocused,
  } = state;
  const dynamicOrigin = isOriginFocused
    ? arrowOriginPropName
    : arrowDestinationPropName;

  return function highlightNode(nodeLocationId) {
    const connected = get(arrowMetadata, [nodeLocationId, 'connected_loc_opacity'], {});
    const node = bubbles.select(`.${cleanCssName(nodeLocationId)}`).datum();
    if (node && node.tippyTip) {
      node.tippyTip.forEach(tip => tip.show());
    }
    const nodeOpacityFunction = datum => (connected[datum[geographyPropName]]
      ? connected[datum[geographyPropName]]
      : bubbleHiddenOpacity);
    bubbles.selectAll('circle')
      .style('opacity', nodeOpacityFunction);
    labels.selectAll('text')
      .style('opacity', nodeOpacityFunction);

    const join = arrows
      .selectAll('path')
      .data(get(arrowMetadata, [nodeLocationId, 'connected_arrows'], []));

    const getFill = (datum) => {
      // lookup color scale from node name
      const { colorScale } = arrowMetadata[datum[dynamicOrigin]];
      return colorScale(Math.abs(datum[arrowFlowPropName]));
    };

    const enter = join
      .enter()
      .append('path')
      .attr('class', cleanCssName(nodeLocationId))
      .style('pointer-events', 'none')
      .style('stroke', 'lightgray')
      .style('stroke-width', '0.5px');

    join
      .merge(enter)
      .attr('d', arrowPathFunction)
      .style('fill', getFill)
      .style('opacity', arrowHighlightOpacity);

    join.exit().remove();
  };
}

export function unHighlightNodeFunction(arrows, bubbles, state) {
  const {
    arrowDefaultOpacity,
  } = state;
  return (nodeLocationId) => {
    const node = bubbles.select(`.${cleanCssName(nodeLocationId)}`).datum();
    if (node && node.tippyTip) {
      node.tippyTip.forEach(tip => tip.hide());
    }
    arrows.selectAll(`path.${cleanCssName(nodeLocationId)}`)
      .style('opacity', arrowDefaultOpacity)
      .remove();
  };
}

export default function drawArrowsHighlight(selections, settings, state) {
  const {
    arrowsSelect: selection,
    bubbles,
    labels,
  } = selections;
  const {
    arrowConnectedLocationSelection = [],
  } = state;
  const { transition: { duration } } = settings;

  if (arrowConnectedLocationSelection.length > 0) {
    const highlightNode = highlightNodeFunction(selection, bubbles, labels, state);
    arrowConnectedLocationSelection.forEach(node => highlightNode(node));
    return;
  }
  selection
    .selectAll('path')
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
