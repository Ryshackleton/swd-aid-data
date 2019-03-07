import { json } from 'd3';
import config from '../app.config';

const { PATH_TO_DIST_DATA } = config;

export default {
  flowDataAllProps: json(`${PATH_TO_DIST_DATA}/flowDataAllProps.json`),
  nodeMonetaryDonationFlows: json(`${PATH_TO_DIST_DATA}/nodeMonetaryDonationFlows.json`),
  topology: json(`${PATH_TO_DIST_DATA}/world-topo-no-antarctica.json`),
};
