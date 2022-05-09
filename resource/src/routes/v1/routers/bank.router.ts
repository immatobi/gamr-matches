import express from 'express';
import { CacheKeys } from '../../../utils/cache.util'

import {
    getBank,
    getBanks,
    createBank,
    enableBank,
    disableBank,
    removebank
} from '../../../controllers/bank.controller';

import advancedResults from '../../../middleware/advanced.mw';

const router = express.Router({ mergeParams: true });
import { protect, authorize } from '../../../middleware/auth.mw';

import { validateChannels as vcd } from '../../../middleware/header.mw'
import Bank from '../../../models/Bank.model'

router.get('/', vcd, advancedResults(Bank,[], CacheKeys.Banks, 'name', true), getBanks);
router.get('/:id', vcd, getBank);
router.post('/', vcd, protect, authorize(['superadmin']), createBank);
router.put('/enable/:id', vcd, protect, authorize(['superadmin', 'admin']), enableBank);
router.put('/disable/:id', vcd, protect, authorize(['superadmin', 'admin']), disableBank);
router.delete('/:id', vcd, protect, authorize(['superadmin', 'admin']), removebank);

export default router;