import express, { Router } from 'express'
import { CacheKeys} from '../../../utils/cache.util'

import {
    getFixtures,
    getFixture,
    addFixture,
    updateLeague,
    addMatches
} from '../../../controllers/fixture.controller';

import advanced from '../../../middleware/adanced.mw'
import Fixture from '../../../models/Fixture.model'

const router: Router = express.Router({ mergeParams: true });

import { protect, authorize } from '../../../middleware/auth.mw'
import { validateChannels as vcd } from '../../../middleware/header.mw';

const roles = ['superadmin', 'admin'];
const allRoles = ['superadmin', 'admin', 'manager'];

router.get('/', vcd, protect, authorize(allRoles), advanced(Fixture, [
    { path: 'matches', populate: [
        { path: 'teams' }
    ] },
    { path: 'league' }
], CacheKeys.Fixtures, 'fixtureID', true), getFixtures);
router.get('/:id', vcd, protect, authorize(allRoles), getFixture);
router.post('/', vcd, protect, authorize(allRoles), addFixture);
router.put('/add-matches/:id', vcd, protect, authorize(allRoles), addMatches);
router.put('/update-league/:id', vcd, protect, authorize(allRoles), updateLeague);


export default router;