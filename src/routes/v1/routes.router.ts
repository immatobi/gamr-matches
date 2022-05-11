import express, { Request, Response, NextFunction } from 'express';

// import route files
import authRoutes from './routers/auth.router'
import emailRoutes from './routers/email.router'
import userRoutes from './routers/user.router'
import countryRoutes from './routers/country.router'
import languageRoutes from './routers/language.router'
import leagueRoutes from './routers/league.router'
import fixtureRoutes from './routers/fixture.router'
import matchRoutes from './routers/match.router'
import teamRoutes from './routers/team.router'


// create router
const router = express.Router();

// define routes
router.use('/auth', authRoutes);
router.use('/emails', emailRoutes);
router.use('/users', userRoutes);
router.use('/countries', countryRoutes);
router.use('/language', languageRoutes);
router.use('/leagues', leagueRoutes);
router.use('/fixtures', fixtureRoutes);
router.use('/matches', matchRoutes);
router.use('/teams', teamRoutes);

router.get('/', (req: Request, res: Response, next: NextFunction) => {

    res.status(200).json({
        error: false,
        errors: [],
        message: 'successful',
        data: {
            name: 'gamr-matches-app',
            version: '1.0.0'
        },
        status: 200
    })

});

export default router;