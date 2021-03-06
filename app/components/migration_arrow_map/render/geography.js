/* global Path2D */
export default function drawGeography(selections, settings, state) {
  const {
    geography,
    geographyCtx,
    geographyJoin,
  } = selections;
  const {
    features,
    path,
    topojsonLocationPropName,
    transition: { duration },
  } = settings;
  const {
    isCartogram,
    colorAccessor,
  } = state;

  function drawCanvasGeography(d) {
    geographyCtx.globalAlpha = 1;
    geographyCtx.strokeStyle = '#5c5c5c';
    geographyCtx.lineWidth = 0.25;
    geographyCtx.fillStyle = colorAccessor(d) || 'transparent';

    const geographyPath = new Path2D(path(d));
    geographyCtx.stroke(geographyPath);
    geographyCtx.fill(geographyPath);
  }

  const { width, height } = geography.node().getBoundingClientRect();

  if (isCartogram) {
    geographyJoin
      .selectAll('path')
      .transition()
      .duration(duration / 2)
      .tween('dummy', () => (t) => {
        geographyCtx.globalAlpha = 1 - t;
      })
      .on('end', () => {
        geographyCtx.clearRect(0, 0, width, height);
        geographyJoin.selectAll('path').remove();
      });
    return;
  }

  geographyCtx.clearRect(0, 0, width, height);
  const join = geographyJoin
    .selectAll('path')
    .data(
      features,
      datum => (
        `${datum.properties[topojsonLocationPropName]}__${colorAccessor(datum) || 'transparent'}`
      ),
    );

  join
    .enter()
    .append('path')
    .transition()
    .delay(100)
    .on('end', drawCanvasGeography);

  join
    .each(drawCanvasGeography);
  join
    .exit()
    .remove();
}
