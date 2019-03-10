// stolen directly from: https://observablehq.com/@trebor/quantized-color-scale
import { format, quantize, scaleQuantize } from 'd3';
import * as chromatic from 'd3-scale-chromatic';
import { formatWithSuffixToPrecision } from './utils';

export default function quantizeColorScaleFactory(
  scale,
  count,
  chromaticName = 'interpolateRdYlGn',
  width = 200,
  height = 20,
) {
  const colorScale = scaleQuantize()
    .domain(scale.range())
    .range(quantize(chromatic[chromaticName], count));

  const colorDivs = colorScale
    .range()
    .map(c => `<div title="${c}" style="\
                        flex: 1 1 auto; height: ${height}px; background: ${c};"></div>`);

  const ticks = colorScale.range().filter((d, i, a) => i < a.length - 1).map((c, i) => `<div style="
          font-family: Trebuchet MS, Helvetica, sans-serif;
          font-size: 20px;"
        >${formatWithSuffixToPrecision(0, scale.invert(colorScale.invertExtent(c)[1]))}</div>`);

  const legend = `
    <div style="
      display: flex;
      flex-direction: column;
      width: ${width}px;"
    >
      <div style="
        flex-direction: row;
        display: flex;
        justify-content: space-around;
        border: 1px solid #888;"
      >
        ${colorDivs.join('')}
      </div>
      <div style="
        flex-direction: row;
        display: flex;
        justify-content: space-around;
        padding: 0px ${width / (count) / 2}px;"
      >
        ${ticks.join('')}
      </div>
    </div>`;

  return {
    scale: value => colorScale(scale(value)),
    legend,
  };
}
