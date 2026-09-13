import {validateBoundaryCollection, type BoundaryCollection} from '@atlas/domain/boundaries';
import rawCollection from '../../../../data/boundary-collection.json';

export const boundaryCollection = validateBoundaryCollection(rawCollection as BoundaryCollection);
