/* global document window */
import './scss/app.scss';
import ScrollyTeller from 'scrolly-teller';
import arrowMapSection from './containers/arrow_map_section';

export default class App {
  constructor() {
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
    const myScrollyTellerInstance = new ScrollyTeller(myScrollyTellerConfig);

    /** parse data and build all HMTL */
    myScrollyTellerInstance.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
