import { voronoi } from 'd3';
import { get } from 'lodash';
import { cleanCssName } from '../utils/utils';

export default function drawVoronoi(selection, settings, state, selections) {
  const {
    topoJSONBaseWidth: width,
    topoJSONBaseHeight: height,
    transition: { duration },
  } = settings;
  const {
    arrowMetadata,
    arrowDestinationPropName,
    arrowFlowPropName,
    arrowOriginPropName,
    arrowPathFunction,
    isOriginFocused,
    arrowConnectedGeographiesCssSeletor,
    arrowDefaultOpacity,
    arrowHighlightOpacity,
    bubbleDefaultOpacity,
    bubbleHiddenOpacity,
    nodeData,
    nodeHoverState,
    cssNameLookup,
    isDisplayingVoronoi,
    geographyPropName,
    labelDefaultOpacity,
    xAccessor,
    yAccessor,
  } = state;
  const {
    arrows,
    bubbles,
    labels,
    svg,
  } = selections;

  selection
    .selectAll('path')
    .remove();

  if (!(nodeHoverState === 'HIGHLIGHT_CONNECTED' || nodeHoverState === 'HOT_BUILD_CONNECTED')) {
    return;
  }

  // voronoi
  const cells = voronoi()
    .x(xAccessor)
    .y(yAccessor)
    .extent([[-width / 2, -height / 2], [width * 1.5, height * 1.5]])
    .polygons(nodeData);

  const paths = selection
    .selectAll('path')
    .data(cells)
    .enter()
    .append('path')
    .attr('d', d => (`M${d.join('L')}Z`))
    .style('pointer-events', 'all')
    .style('fill', 'transparent')
    .style('opacity', 0);

  paths
    .transition()
    .duration(duration)
    .style('stroke', isDisplayingVoronoi ? 'gray' : 'transparent')
    .style('opacity', 1);

  if (nodeHoverState === 'HIGHLIGHT_CONNECTED') {
    paths
      .on('mouseover', (polygon) => {
        arrows.selectAll(`:not(.${cssNameLookup[polygon.data[geographyPropName]]})`)
          .transition()
          .duration(duration)
          .style('opacity', 0);
        arrows.selectAll(`.${cssNameLookup[polygon.data[geographyPropName]]}`)
          .transition()
          .duration(duration)
          .style('opacity', arrowHighlightOpacity);

        bubbles
          .selectAll('circle')
          .transition()
          .duration(duration)
          .style('opacity', bubbleHiddenOpacity);
        bubbles.selectAll(`${arrowConnectedGeographiesCssSeletor[polygon.data[geographyPropName]]}`)
          .transition()
          .duration(duration)
          .style('opacity', bubbleDefaultOpacity);

        labels.selectAll('*')
          .transition()
          .duration(duration)
          .style('opacity', bubbleHiddenOpacity);
        labels.selectAll(`${arrowConnectedGeographiesCssSeletor[polygon.data[geographyPropName]]}`)
          .transition()
          .duration(duration)
          .style('opacity', labelDefaultOpacity);
      })
      .on('mouseout', () => {
        bubbles.selectAll('circle')
          .transition()
          .duration(duration)
          .style('opacity', bubbleDefaultOpacity);
        labels.selectAll('*')
          .transition()
          .duration(duration)
          .style('opacity', labelDefaultOpacity);
        arrows.selectAll('*')
          .transition()
          .duration(duration)
          .style('opacity', arrowDefaultOpacity);
      });
  }
  if (nodeHoverState === 'HOT_BUILD_CONNECTED') {
    const dynamicOrigin = isOriginFocused
      ? arrowOriginPropName
      : arrowDestinationPropName;

    svg.on('mouseout', () => {
      bubbles.selectAll('circle')
        .style('opacity', bubbleDefaultOpacity);
      labels.selectAll('text')
        .style('opacity', labelDefaultOpacity);
    });

    paths.on('mouseover', (node) => {
      const nodeLoc = node.data[geographyPropName];

      const connected = get(arrowMetadata, [nodeLoc, 'connected_loc_opacity'], {});
      const nodeOpacityFunction = datum => (connected[datum[geographyPropName]]
        ? connected[datum[geographyPropName]]
        : bubbleHiddenOpacity);
      bubbles.selectAll('circle')
        .style('opacity', nodeOpacityFunction);
      labels.selectAll('text')
        .style('opacity', nodeOpacityFunction);

      const join = arrows
        .selectAll('path')
        .data(get(arrowMetadata, [nodeLoc, 'connected_arrows'], []));

      const enter = join
        .enter()
        .append('path')
        .attr('class', cleanCssName(nodeLoc))
        .style('pointer-events', 'none')
        .attr('stroke', 'lightgray')
        .style('stroke-width', '0.5px');

      join
        .merge(enter)
        .attr('d', arrowPathFunction)
        .attr('opacity', arrowHighlightOpacity)
        .attr('fill', (datum) => {
          // lookup color scale from node name
          const { colorScale } = arrowMetadata[datum[dynamicOrigin]];
          return colorScale(Math.abs(datum[arrowFlowPropName]));
        });

      join.exit().remove();
    })
      .on('mouseout', (node) => {
        const nodeLoc = node.data[geographyPropName];
        arrows.selectAll(`path.${cleanCssName(nodeLoc)}`)
          .style('opacity', arrowDefaultOpacity)
          .remove();
      });
  }
}
