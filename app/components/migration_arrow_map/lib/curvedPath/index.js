// Cpoied verbatim from this Observablehq Notebook: https://observablehq.com/@stuartathompson/standalone-function-for-a-graduated-stroke-on-a-curved-path

/* eslint-disable */
const getDistanceBetweenPoints = (p1, p2) => {
  var a = p1[0] - p2[0];
  var b = p1[1] - p2[1];

  return Math.sqrt( a*a + b*b );
};

const getAngledLineFromPoints = (p1, p2, distance, pCenter, perp) => {
  // Start and end points
  var x1 = p1[0],
    y1 = p1[1],
    x2 = p2[0],
    y2 = p2[1],
    centerX = pCenter[0],
    centerY = pCenter[1];
  var angle = Math.atan2(y2 - y1, x2 - x1);

  // Draw a normal to the line above
  if (perp) {
    return [
      [Math.sin(angle) * distance + centerX, -Math.cos(angle) * distance + centerY],
      [-Math.sin(angle) * distance + centerX, Math.cos(angle) * distance + centerY],
      angle,
    ];
  } else {

    return [
      [Math.cos(angle) * distance + centerX, Math.sin(angle) * distance + centerY],
      [Math.cos(angle) * -distance + centerX, Math.sin(angle) * -distance + centerY],
      angle,
    ];
  }
};

const getMidpoint = (p1, p2) => {
  var x1 = p1[0],
    y1 = p1[1],
    x2 = p2[0],
    y2 = p2[1]
 return [(x1+x2)/2, (y1+y2)/2]
};

export default (data, size) => {
  // Data should be an array containing three [x,y] arrays representing the start, middle and endpoint
  // Size reflects the size of the arrow value
  var p1 = data[0]
  var p2 = data[1]
  var p3 = data[2]

  // Midpoint between first and last point
  var midPoint = getMidpoint(p1, p3)

  // Store whether the midpoint is above or below the plane between point 1 and 3 – important for determining order when drawing the path
  var perpLineRightOfEndpoint = data[0][0] > data[2][0]
  var pathAbovePlane =  midPoint[1] > data[1][1]
  pathAbovePlane = perpLineRightOfEndpoint ? !pathAbovePlane : pathAbovePlane

  p3 = getAngledLineFromPoints(p2, p3, -5, p3, false)[0]

  // Get the coordinates for the midpoint based on the "size" value
  var perpLineCoordinates = getAngledLineFromPoints(midPoint, p2, size*.3, p2, false)

  // Establish the angle and "size" of the endpoint, based on the perp angle from point 1 to point 2
  var newStartCoordinates = getAngledLineFromPoints(p1, p2, 1, p1, true)
  // Get the offset endpoint, which is the point minus some pixels so the arrow point ends on the right spot
  var newEndpointCoordinates = getAngledLineFromPoints(p2, p3, -size, p3, false)
  // Get the width of the line at the end of the path
  var endLineCoordinates = getAngledLineFromPoints(p2, p3, size*.5, newEndpointCoordinates[0], true)
  // Get the larger width to begin drawing the "points" of the arrow
  var arrowCoordinates = getAngledLineFromPoints(p2, p3, size, newEndpointCoordinates[0], true)
  // Determine whether order of drawing endpoints should be flipped based on distance between middle point and end point
  var midPointClosestToFirstEndPoint = getDistanceBetweenPoints(perpLineCoordinates[0], endLineCoordinates[0]) > getDistanceBetweenPoints(perpLineCoordinates[0], endLineCoordinates[1])
  var midPointClosestToFirstStartPoint = getDistanceBetweenPoints(perpLineCoordinates[0], newStartCoordinates[0]) > getDistanceBetweenPoints(perpLineCoordinates[0], newStartCoordinates[1])

  // Update the path itself using newly derived midpoints and endpoints
  var startLow = midPointClosestToFirstStartPoint ? newStartCoordinates[1] : newStartCoordinates[0]
  var startHigh = midPointClosestToFirstStartPoint ? newStartCoordinates[0] : newStartCoordinates[1]
  var midLow = perpLineCoordinates[0]
  var midHigh = perpLineCoordinates[1]
  var endLow = midPointClosestToFirstEndPoint ? endLineCoordinates[1] : endLineCoordinates[0]
  var endHigh = midPointClosestToFirstEndPoint ? endLineCoordinates[0] : endLineCoordinates[1]
  var endWideLow = midPointClosestToFirstEndPoint ? arrowCoordinates[1] : arrowCoordinates[0]
  var endWideHigh = midPointClosestToFirstEndPoint ? arrowCoordinates[0] : arrowCoordinates[1]
  var endPoint = p3

  return `M ${startHigh}
          L ${startLow}
          Q ${[midLow[0], midLow[1]]} ${[endLow[0],endLow[1]]}
          L ${[endWideLow[0],endWideLow[1]]}
          L ${[endPoint[0],endPoint[1]]}
          L ${[endWideHigh[0],endWideHigh[1]]}
          L ${[endHigh[0],endHigh[1]]} Q ${[midHigh[0], midHigh[1]]} ${startHigh} Z`
}
/* eslint-enable */
