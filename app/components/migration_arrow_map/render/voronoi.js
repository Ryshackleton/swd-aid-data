import { voronoi } from 'd3';
import { highlightNodeFunction, unHighlightNodeFunction } from './arrowsSelect';
import { cleanCssName } from '../utils/utils';

export default function drawVoronoi(selections, settings, state) {
  const {
    arrowsSelect,
    bubbles,
    labels,
    svg,
    voronoi: selection,
  } = selections;
  const {
    topoJSONBaseWidth: width,
    topoJSONBaseHeight: height,
    transition: { duration },
  } = settings;
  const {
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
    .attr('class', d => cleanCssName(d.data[geographyPropName]))
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
        arrowsSelect.selectAll(`:not(.${cssNameLookup[polygon.data[geographyPropName]]})`)
          .transition()
          .duration(duration)
          .style('opacity', 0);
        arrowsSelect.selectAll(`.${cssNameLookup[polygon.data[geographyPropName]]}`)
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
        arrowsSelect.selectAll('*')
          .transition()
          .duration(duration)
          .style('opacity', arrowDefaultOpacity);
      });
  }
  if (nodeHoverState === 'HOT_BUILD_CONNECTED') {
    const highlightNode = highlightNodeFunction(arrowsSelect, bubbles, labels, state);
    const unHighlightNode = unHighlightNodeFunction(arrowsSelect, bubbles, state);

    svg
      .on('mouseout', () => {
        bubbles.selectAll('circle')
          .style('opacity', bubbleDefaultOpacity);
        labels.selectAll('text')
          .style('opacity', labelDefaultOpacity);
      });

    paths
      .on('mouseover', d => highlightNode(d.data[geographyPropName]))
      .on('mouseout', d => unHighlightNode(d.data[geographyPropName]));
  }
}
