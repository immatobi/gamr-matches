import express, { Request, Response, NextFunction } from 'express';

// routers
import bankRoutes from './routers/bank.router';
import assetRoutes from './routers/asset.router';
import countryRoutes from './routers/country.router';
import languageRoutes from './routers/language.router';
import coinRoutes from './routers/coin.router';
import placeRoutes from './routers/location.router';

// create router
const router = express.Router();

// define routes
router.use('/banks', bankRoutes);
router.use('/assets', assetRoutes);
router.use('/countries', countryRoutes);
router.use('/languages', languageRoutes);
router.use('/coins', coinRoutes);
router.use('/locations', placeRoutes );

// for unmapped routes
router.get('/', (req: Request, res: Response, next: NextFunction) => {

	res.status(200).json({
		status: 'success',
		data: {
			name: 'xpresschain-resource-service',
			version: '0.1.0'
		}
	})
	
});

export default router;