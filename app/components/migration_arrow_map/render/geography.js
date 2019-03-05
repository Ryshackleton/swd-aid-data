import { feature } from 'topojson';

export default function drawGeography(selection, settings, state) {
  const {
    bubbleDefaultOpacity,
    featureSet,
    path,
    topology,
    topojsonLocationPropName,
    transition: { duration },
  } = settings;
  const {
    isCartogram,
    colorAccessor,
    geographyClassAccessor,
  } = state;

  const paths = selection
    .selectAll('path')
    .data(
      isCartogram ? [] : feature(topology, topology.objects[featureSet]).features,
      datum => (datum.properties[topojsonLocationPropName])
    );

  const enter = paths
    .enter()
    .append('path')
    .attr('class', geographyClassAccessor)
    .attr('d', path)
    .style('fill', colorAccessor)
    .style('stroke', 'gray')
    .style('stroke-width', '0.25px')
    .style('opacity', 0);

  paths
    .merge(enter)
    .transition()
    .duration(duration)
    .style('opacity', bubbleDefaultOpacity)
    .style('fill', colorAccessor);

  paths
    .exit()
    .transition()
    .duration(duration)
    .style('opacity', 0)
    .remove();
}
