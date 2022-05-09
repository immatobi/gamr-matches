import express from 'express';
import { CacheKeys } from '../../../utils/cache.util'

import {
    getLanguages,
    getLanguage
} from '../../../controllers/language.controller';

import advancedResults from '../../../middleware/adanced.mw';

const router = express.Router({ mergeParams: true });

import { protect, authorize } from '../../../middleware/auth.mw';
import { validateChannels as vcd } from '../../../middleware/header.mw'
import Language from '../../../models/Language.model'

router.get('/', vcd, advancedResults(Language, [], CacheKeys.Languages, 'name', true), getLanguages);
router.get('/:id', vcd, getLanguage);

export default router;