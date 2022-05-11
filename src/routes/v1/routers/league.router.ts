import express, { Router } from 'express'
import { CacheKeys} from '../../../utils/cache.util'

import {
    getLeagues,
    getLeague,
    addLeague,
    addFixture,
    addMatch,
    addTeam,
    updateLeague
} from '../../../controllers/league.controller';

import advanced from '../../../middleware/adanced.mw'
import League from '../../../models/League.model'

const router: Router = express.Router({ mergeParams: true });

import { protect, authorize } from '../../../middleware/auth.mw'
import { validateChannels as vcd } from '../../../middleware/header.mw';

const roles = ['superadmin', 'admin'];
const allRoles = ['superadmin', 'admin', 'manager'];

router.get('/', vcd, protect, authorize(allRoles), advanced(League, [
    { path: 'fixtures', populate: [
        { path: 'matches' }
    ] },
    { path: 'matches', populate: [
        { path: 'teams' }
    ] },
    { path: 'teams' }
], CacheKeys.Leagues, 'name', true), getLeagues);
router.get('/:id', vcd, protect, authorize(allRoles), getLeague);
router.post('/', vcd, protect, authorize(allRoles), addLeague);
router.put('/:id', vcd, protect, authorize(allRoles), updateLeague);
router.put('/add-team/:id', vcd, protect, authorize(allRoles), addTeam);
router.put('/add-match/:id', vcd, protect, authorize(allRoles), addMatch);
router.put('/add-fixture/:id', vcd, protect, authorize(allRoles), addFixture);


export default router;