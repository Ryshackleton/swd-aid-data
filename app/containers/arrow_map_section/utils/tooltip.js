import chroma from 'chroma-js';
import { scaleLinear, extent } from 'd3';
import { get } from 'lodash';
import tippy from 'tippy.js';
import { formatAmt } from './util';

export function createTooltipFromState(state, targetSelector) {
  return function buildTooltipHTML(d) {
    const {
      arrowFlowPropName,
      arrowOriginLabelProp,
      arrowDestnationLabelProp,
      arrowMetadata,
      colorFromValue,
      colorPropName,
      geographyClassAccessor,
      geographyPropName,
      isOriginFocused,
      labelLongName,
    } = state;
    const datum = get(d, 'data', d);
    const nodeLoc = datum[geographyPropName];
    const name = datum[labelLongName];
    const loc = geographyClassAccessor(datum);

    // ASSUME THE ARROWS ARE SORTED IN ASCENDING ORDER AS IN ARROW ACCESSORS!!!!
    const connected = get(arrowMetadata, [nodeLoc, 'connected_arrows'], []);
    const conn = connected.slice(connected.length - 5, connected.length).reverse();
    const selfAmt = formatAmt(datum[colorPropName]);
    const selfDonated = formatAmt(datum.net_donated);
    const selfReceived = formatAmt(datum.net_received);

    const xScale = scaleLinear().domain(extent(conn, c => c[arrowFlowPropName])).range([75, 150]);
    const top5 = conn.map((c) => {
      const val = c[arrowFlowPropName];
      const color = colorFromValue(isOriginFocused ? val : -val);
      const reverseColor = chroma(color).luminance() < 0.5
        ? chroma(color).brighten(3)
        : chroma(color).darken(3);

      const amt = formatAmt(val);
      const otherName = isOriginFocused ? c[arrowDestnationLabelProp] : c[arrowOriginLabelProp];
      return `<div style="background-color:${color};\
                          color:${reverseColor};\
                          width:${xScale(val)}px;">${otherName} - $${amt}</div>`;
    });
    const donorOrRecip = isOriginFocused ? 'Recipients' : 'Donors';
    const donatedOrReceived = isOriginFocused ? 'Net Donation' : 'Net Received';
    const connectionsText = top5.length === 0
      ? `No ${donorOrRecip}`
      : `Top ${top5.length} ${donorOrRecip}`;

    const html = `<div>
                    <span><strong>${name}</strong>: $${selfAmt} ${donatedOrReceived}</span>
                    <div><em>Donated: $${selfDonated}</em></div>
                    <div><em>Received: $${selfReceived}</em></div>
                    <div>${connectionsText}</div>
                    <div class="tooltip-chart">
                      ${top5.join('')}
                    </div>
                  </div>`;

    const tippyOpts = {
      content: html,
      // distance: radiusAccessor(datum) || 20,
      theme: 'light-border',
      // followCursor: 'initial', // 'true',
      hideOnClick: true,
      animation: 'fade',
      delay: 100,
      arrow: true,
    };
    if (datum.tippyTip) {
      datum.tippyTip.forEach(tip => tip.destroy());
    }
    datum.tippyTip = tippy(`${targetSelector} .${loc}`, tippyOpts);
  };
}