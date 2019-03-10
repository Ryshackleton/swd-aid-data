import { feature } from 'topojson';
import polylabel from 'polylabel';

export function cleanCssName(string) {
  return `__${string.toString().split(' ').join('')}__`;
}

export function formatWithSuffixToPrecision(precision, num) {
  function findPowerOf1000(acc, num) {
    if (num < 1000) return acc;
    return findPowerOf1000(acc + 1, num / 1000);
  }

  const suffixTable = {
    0: '', // * 1000^0
    1: 'T', // * 1000^1
    2: 'M', // * 1000^2
    3: 'B', // * 1000^3
    4: 'T', // * 1000^4
  };

  const negativitiy = num / num;

  // constrain to 4 or less; no suffix greater than T (trillion)
  const powerOf1000 = Math.min(findPowerOf1000(0, Math.abs(num)), 4);
  // get corresponding suffix
  const suffix = suffixTable[powerOf1000];

  const theValue = (negativitiy * num / Math.pow(1000, powerOf1000));
  return theValue % 1 !== 0
    ? theValue.toFixed(precision) + suffix
    : theValue.toFixed(0) + suffix;
}

function subArrayWithLargestArrayLength(arrayOfArrays) {
  return arrayOfArrays.reduce((longestArray, thisArray) => (longestArray.length < thisArray.length
    ? thisArray
    : longestArray), []);
}

function polygonWithLongestCoordinateCount(eachFeature) {
  // for multi polygons, we need to look through their sub arrays to find the polygon with the most
  // vertices
  if (eachFeature.geometry.type.includes('Multi')) {
    return eachFeature.geometry.coordinates.reduce((longest, subPolygons) => {
      const thisLongest = subArrayWithLargestArrayLength(subPolygons);
      return longest.length < thisLongest.length
        ? thisLongest
        : longest;
    }, []);
  }
  // for Polygons, there's only 1 polygon, return it
  return eachFeature.geometry.coordinates[0];
}

/**
 * Assigns a prop called 'poleOfInaccessibility' to each feature.properties in the feature collection
 * The pole of inaccessibility (https://www.npmjs.com/package/polylabel) the most distant internal
 * point from the polygon outline, which is useful for labeling
 * This method uses a dumb method to handle features with MultiPolygons (because polylabel doesn't):
 *   To determine which sub-polygon to place the point of accessibility in, it searches
 *   MultiPolygons for the sub-polygon with the most vertices, assuming that one will be the longest
 * @param featureCollection {object} - GEOJSON FeatureCollection object to add point of inaccessibility to
 * @param precision {number} - precision passed to polylabel().  See their documentation for details.
 * @return undefined - mutates the featureCollection by setting
 *      feature.properties.poleOfInaccessibility to each feature in the FeatureCollection
 */
export function assignPoleOfInaccessibilityToProperties(featureCollection, precision = 1.0) {
  featureCollection.features.forEach((eachFeature) => {
    eachFeature.properties.poleOfInaccessibility = polylabel(
      [polygonWithLongestCoordinateCount(eachFeature)],
      precision,
    );
  });
}

export function getFeatureArray({ topology, featureSets }) {
  return featureSets.reduce((acc, set) => {
    const featureSet = feature(topology, topology.objects[set]);
    assignPoleOfInaccessibilityToProperties(featureSet);
    return acc.concat(featureSet.features);
  }, []);
}
