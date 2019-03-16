import {
  forceSimulation, forceX, forceY, forceCollide,
} from 'd3';

/* eslint-disable no-plusplus, import/prefer-default-export */
export const forcePackNodesToRadii = ({
  nodes,
  alphaMin = 0.01,
  collideStrength = 0.8,
  maxTicks = 1000,
  radiusPadding = 0.3,
  radiusAccessor,
  xAccessor,
  yAccessor,
  xStrength = 0.2,
  yStrength = 0.2,
  width,
  height,
}) => {
  const force = forceSimulation(nodes)
    .force('x',
      forceX()
        .x(d => xAccessor(d))
        .strength(xStrength))
    .force('y',
      forceY()
        .y(d => yAccessor(d))
        .strength(yStrength))
    .force('collide',
      forceCollide()
        .strength(collideStrength)
        .radius(d => radiusAccessor(d) + radiusPadding))
    .stop();

  let x;
  let y;
  let r;
  function boundaryConstrain() {
    nodes.forEach((node) => {
      x = xAccessor(node);
      y = yAccessor(node);
      r = radiusAccessor(node);
      node.x = Math.max(r - radiusPadding, Math.min(width - r - radiusPadding, x));
      node.y = Math.max(r - radiusPadding, Math.min(height - r - radiusPadding, y));
    });
  }

  let i = 0;
  while (force.alpha() > alphaMin && ++i !== maxTicks) {
    if (width && height) {
      boundaryConstrain();
    }
    force.tick();
  }

  return nodes;
};
/* eslint-enable no-plusplus, import/prefer-default-export */
