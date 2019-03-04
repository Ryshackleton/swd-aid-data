import { csv, json } from 'd3';
import config from '../app.config';

const { PATH_TO_DIST_DATA } = config;

export default {
  nonZeroOutwardMigration: csv(`${PATH_TO_DIST_DATA}/nonZeroOutwardMigration.csv`),
  populationChange: csv(`${PATH_TO_DIST_DATA}/populationChange.csv`),
  topology: json(`${PATH_TO_DIST_DATA}/usa-topo-fips.json`),
};
