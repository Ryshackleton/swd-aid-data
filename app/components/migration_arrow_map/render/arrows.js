/* global Path2D */
export default function drawArrows(selections, settings, state) {
  const {
    arrows,
    arrowsCtx,
    arrowsJoin,
  } = selections;
  const {
    arrowMetadata,
    arrowDefaultOpacity,
    arrowDestinationPropName,
    arrowFlowPropName,
    arrowOriginPropName,
    arrowPathFunction,
    flowData,
    nodeHoverState,
    isDisplayingArrows,
    isOriginFocused,
  } = state;
  const {
    transition: { duration },
  } = settings;

  const dynamicOrigin = isOriginFocused
    ? arrowOriginPropName
    : arrowDestinationPropName;

  function drawCanvasArrow(d) {
    arrowsCtx.globalAlpha = arrowDefaultOpacity;
    arrowsCtx.strokeStyle = 'lightgray';
    arrowsCtx.lineWidth = 0.5;
    const { colorScale } = arrowMetadata[d[dynamicOrigin]];
    arrowsCtx.fillStyle = colorScale(Math.abs(d[arrowFlowPropName]));

    const arrowPath = new Path2D(arrowPathFunction(d));
    arrowsCtx.stroke(arrowPath);
    arrowsCtx.fill(arrowPath);
  }

  const { width, height } = arrows.node().getBoundingClientRect();

  if (
    !isDisplayingArrows
    || nodeHoverState === 'HOT_BUILD_CONNECTED'
  ) {
    arrowsJoin
      .selectAll('path')
      .transition()
      .duration(duration / 2)
      .tween('dummy', () => (t) => {
        arrowsCtx.globalAlpha = 1 - t;
      })
      .on('end', () => {
        arrowsCtx.clearRect(0, 0, width, height);
        arrowsJoin.selectAll('path').remove();
      });
    return;
  }

  // just start the animation and leave it, don't try to track the selection
  arrowsJoin
    .selectAll('path')
    .data(flowData)
    .enter()
    .append('path')
    .transition()
    .duration(duration)
    .delay((d, i) => (i * 10))
    .on('end', drawCanvasArrow);
}
