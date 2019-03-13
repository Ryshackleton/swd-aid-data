import { identity } from 'lodash';
// stolen directly from: https://observablehq.com/@trebor/quantized-color-scale
import { quantize, scaleQuantize } from 'd3';
import * as chromatic from 'd3-scale-chromatic';

export default function quantizeColorScaleFactory(
  scale,
  count,
  chromaticName = 'interpolateRdYlGn',
  width = 200,
  height = 20,
  title = '',
  tickFontStylesString = 'font-family: Trebuchet MS, Helvetica, sans-serif; font-size: 16px;',
  titleFontStylesString = 'font-family: Trebuchet MS, Helvetica, sans-serif; font-size: 20px;',
  legendTickFormatFunction = identity,
) {
  const colorScale = scaleQuantize()
    .domain(scale.range())
    .range(quantize(chromatic[chromaticName], count));

  const colorDivs = colorScale
    .range()
    .map(c => `<div title="${c}" style="\
                        flex: 1 1 auto; height: ${height}px; background: ${c};"></div>`);

  const fixedTickWidth = width / count;
  const ticks = colorScale.range().filter((d, i, a) => i < a.length - 1).map((c, i) => (
    `<div style="${tickFontStylesString}; text-align: center; width:${fixedTickWidth}px;">
      ${legendTickFormatFunction(scale.invert(colorScale.invertExtent(c)[1]))}
     </div>`
  ));

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
        padding: 3px ${width / (count) / 2}px;"
      >${ticks.join('')}</div>
      <div style="
        flex-direction: row;
        display: flex;
        justify-content: space-around;
        padding: 10px ${width / (count) / 2}px;
        ${titleFontStylesString}"
      >
        ${title}
      </div>
    </div>`;

  return {
    scale: value => colorScale(scale(value)),
    legend,
  };
}
