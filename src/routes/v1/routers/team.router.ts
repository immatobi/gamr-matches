import express, { Router } from 'express'
import { CacheKeys} from '../../../utils/cache.util'

import {
    getTeams,
    getTeam,
    addTeam,
    updateTeam,
    updateLeague
} from '../../../controllers/team.controller';

import advanced from '../../../middleware/adanced.mw'
import Team from '../../../models/Team.model'

const router: Router = express.Router({ mergeParams: true });

import { protect, authorize } from '../../../middleware/auth.mw'
import { validateChannels as vcd } from '../../../middleware/header.mw';

const roles = ['superadmin', 'admin'];
const allRoles = ['superadmin', 'admin', 'manager'];

router.get('/', vcd, protect, authorize(allRoles), advanced(Team, [
    { path: 'leagues' },
    { path: 'matches.league' }
], CacheKeys.Teams, 'name', true), getTeams);
router.get('/:id', vcd, protect, authorize(allRoles), getTeam);
router.post('/', vcd, protect, authorize(allRoles), addTeam);
router.put('/:id', vcd, protect, authorize(allRoles), updateTeam);
router.put('/add-league/:id', vcd, protect, authorize(allRoles), updateLeague);


export default router;