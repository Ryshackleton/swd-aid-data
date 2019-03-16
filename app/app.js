/* global document window */
import { select } from 'd3';
import './scss/app.scss';
import ScrollyTeller from 'scrolly-teller';
import arrowMapSection from './containers/arrow_map_section';

export default class App {
  async render() {
    /** ScrollyTeller */
    const myScrollyTellerConfig = {
      /** The id of the <div> that will contain all of the page content */
      appContainerId: 'scroll_area',
      /** build a list of story sections, keyed by sectionIdentifier.
       * Each section object should be a valid section configuration with
       * the properties defined in the next section */
      sectionList: {
        /** [key = sectionIdentifier]: value = { section config object } */
        [arrowMapSection.sectionIdentifier]: arrowMapSection,
      },
    };

    /** create the ScrollyTeller object to validate the config */
    /** parse data and build all HMTL */
    await (new ScrollyTeller(myScrollyTellerConfig)).render();

    // fade out spinner, fade in content
    select('.spinner').transition().duration(500).style('opacity', 0)
      .on('end', () => {
        select('#scroll_area').transition().duration(1000).style('opacity', 1);
      })
      .remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.render();
});
