import express, { Router } from 'express'
import { CacheKeys} from '../../../utils/cache.util'

import {
    getMatches,
    getMatch,
    addMatch,
    updateMatch,
    updateScore,
    updateStats,
    updateLeague
} from '../../../controllers/match.controller';

import advanced from '../../../middleware/adanced.mw'
import Match from '../../../models/Match.model'

const router: Router = express.Router({ mergeParams: true });

import { protect, authorize } from '../../../middleware/auth.mw'
import { validateChannels as vcd } from '../../../middleware/header.mw';

const roles = ['superadmin', 'admin'];
const allRoles = ['superadmin', 'admin', 'manager'];

router.get('/', vcd, protect, authorize(allRoles), advanced(Match, [
    { path: 'score.team' },
    { path: 'lineups.team' },
    { path: 'stats.team' },
    { path: 'homeTeam' },
    { path: 'country' },
    { path: 'teams' },
    { path: 'fixture' },
], CacheKeys.Matches, 'season', true), getMatches);
router.get('/:id', vcd, protect, authorize(allRoles), getMatch);
router.post('/', vcd, protect, authorize(allRoles), addMatch);
router.put('/:id', vcd, protect, authorize(allRoles), updateMatch);
router.put('/update-score/:id', vcd, protect, authorize(allRoles), updateScore);
router.put('/update-stats/:id', vcd, protect, authorize(allRoles), updateStats);
router.put('/update-league/:id', vcd, protect, authorize(allRoles), updateLeague);


export default router;