import request from 'supertest';
import app from '../src/config/app.config';

let authToken: string = '';
var _country: any, _league: any, _home: any, _away: any, match: any;

describe('Auth :: Login', () => {

    it('logs admin in successfully', async () => {
        
       const resp = await request(app)
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send({
            email: "adminx@gamr.io",
            password: "#_gmAdmin1@"
        })
        .expect(200);

        expect(resp.body.token).toBeDefined();

    })

    it('detects incorrect login [email] details', async () => {
        
        const resp = await request(app)
         .post('/api/v1/auth/login')
         .set('Accept', 'application/json')
         .set('Content-Type',  'application/json')
         .set('lg',  'en')
         .set('ch',  'web')
         .send({
             email: "testxma@gmail.com",
             password: "#_gmAdmin1@"
         })
         .expect(403);
 
         expect(resp.body.errors.length).toBe(1);
 
     })

     it('detects incorrect login [password] details', async () => {
        
        const resp = await request(app)
         .post('/api/v1/auth/login')
         .set('Accept', 'application/json')
         .set('Content-Type',  'application/json')
         .set('lg',  'en')
         .set('ch',  'web')
         .send({
             email: "testxma@gmail.com",
             password: "#commanD565/"
         })
         .expect(403);
 
         expect(resp.body.errors.length).toBe(1);
 
     })

});

describe('Auth :: Register', () => {

    it('register manager successfully', async () => {

        const resp = await request(app)
        .post('/api/v1/auth/register')
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send({
            email: "emmabidem@gmail.com",
            password: "#commanD565/",
            phoneNumber: "08137031202",
            phoneCode: "+234",
            callback: "http://localhost:5000"
        })

        expect(resp.body.status).toBeGreaterThanOrEqual(200)
        expect(resp.body.status).toBeLessThanOrEqual(400);

    })

    it('detects duplicate email', async () => {

        const resp = await request(app)
        .post('/api/v1/auth/register')
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send({
            email: "emmabidem@gmail.com",
            password: "#commanD565/",
            phoneNumber: "08137031202",
            phoneCode: "+234",
            callback: "http://localhost:5000"
        }).expect(400)

    })

})

describe('Matches', () => {

    it('logs in user successfully', async () => {
        
        await request(app)
         .post('/api/v1/auth/login')
         .set('Accept', 'application/json')
         .set('Content-Type',  'application/json')
         .set('lg',  'en')
         .set('ch',  'web')
         .send({
             email: "adminx@gamr.io",
             password: "#_gmAdmin1@"
         })
         .expect(200).then(async (resp) => {
            expect(resp.body.token).toBeDefined();
            authToken = resp.body.token;
        });
         
 
     })

     it('Fetches all matches available', async () => {
        
        const ret = await request(app)
        .get('/api/v1/matches')
        .set('Authorization',  'Bearer ' + authToken)
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send()
        .expect(200).then((resp) => {

            expect(resp.body.length).toBeGreaterThanOrEqual(0);

        }).catch((err) => {

            console.log(err)

        })
 
     })

     it('Fetches all leagues successfuly and picks one', async () => {

        const ret = await request(app)
        .get('/api/v1/leagues')
        .set('Authorization',  'Bearer ' + authToken)
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send()
        .expect(200).then((resp) => {

            expect(resp.body.length).toBeGreaterThanOrEqual(0);
            _league = resp.body.find((l:any) => l.code === 'UEFA');
            expect(_league).toBeDefined();
            expect(_league._id).not.toBe('');

        }).catch((err) => {
            console.log(err)
        })

     })

     it('Fetches all countries successfuly and picks one', async () => {

        const ret = await request(app)
        .get('/api/v1/countries')
        .set('Authorization',  'Bearer ' + authToken)
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send()
        .expect(200).then((resp) => {

            expect(resp.body.length).toBeGreaterThanOrEqual(0);
            _country = resp.body.find((c:any) => c.phoneCode === '+234');
            expect(_country).toBeDefined();
            expect(_country._id).not.toBe('');

        }).catch((err) => {
            console.log(err)
        })

     });

     it('Fetches all teams successfuly and picks two', async () => {

        const ret = await request(app)
        .get('/api/v1/teams')
        .set('Authorization',  'Bearer ' + authToken)
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send()
        .expect(200).then((resp) => {

            expect(resp.body.length).toBeGreaterThanOrEqual(0);

            _home = resp.body.find((t:any) => t.code === 'ARS');
            expect(_home).toBeDefined();
            expect(_home._id).not.toBe('');

            _away = resp.body.find((t:any) => t.code === 'ASV');
            expect(_away).toBeDefined();
            expect(_away._id).not.toBe('');

        }).catch((err) => {
            console.log(err)
        })

     });

     it('Adds a new match and sets a cron job for reminder successfully', async () => {

        const match = {
            round: "Matchday 1 of 56", 
            type: "home", 
            season: "2", 
            stage: "Group Stage", 
            date: "2022/05/20", 
            startTime: "20:00:00", 
            stadium: "Wembly Stadium", 
            homeTeam: _home._id, 
            awayTeam: _away._id, 
            countryId: _country._id, 
            leagueId: _league._id
        }

        const ret = await request(app)
        .post('/api/v1/matches')
        .set('Authorization',  'Bearer ' + authToken)
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send(match)
        .expect(200).then((resp) => {

            expect(resp.body.matchID).toBeDefined();

        }).catch((err) => {
            console.log(err);
        })

     });

})


describe('Fixtures', () => {

    it('logs in user successfully', async () => {
        
        await request(app)
         .post('/api/v1/auth/login')
         .set('Accept', 'application/json')
         .set('Content-Type',  'application/json')
         .set('lg',  'en')
         .set('ch',  'web')
         .send({
             email: "adminx@gamr.io",
             password: "#_gmAdmin1@"
         })
         .expect(200).then(async (resp) => {
            expect(resp.body.token).toBeDefined();
            authToken = resp.body.token;
        });
         
 
     })

     it('Fetches all matches available and picks the first one', async () => {
        
        const ret = await request(app)
        .get('/api/v1/matches')
        .set('Authorization',  'Bearer ' + authToken)
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send()
        .expect(200).then((resp) => {

            expect(resp.body.length).toBeGreaterThanOrEqual(0);
            match = resp.body[0];
            expect(match).toBeDefined();

        }).catch((err) => {

            console.log(err)

        })
 
     })

     it('Fetches all leagues successfuly and picks one', async () => {

        const ret = await request(app)
        .get('/api/v1/leagues')
        .set('Authorization',  'Bearer ' + authToken)
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send()
        .expect(200).then((resp) => {

            expect(resp.body.length).toBeGreaterThanOrEqual(0);
            _league = resp.body.find((l:any) => l.code === 'UEFA');
            expect(_league).toBeDefined();
            expect(_league._id).not.toBe('');

        }).catch((err) => {
            console.log(err)
        })

     })

     it('Adds a new fixture successfully', async () => {

        const fixture = {
            leagueId: _league._id,
            description: "UEFA league fixture",
            matches: [match._id]
        }

        const ret = await request(app)
        .post('/api/v1/fixtures')
        .set('Authorization',  'Bearer ' + authToken)
        .set('Accept', 'application/json')
        .set('Content-Type',  'application/json')
        .set('lg',  'en')
        .set('ch',  'web')
        .send(fixture)
        .expect(200).then((resp) => {

            expect(resp.body.fixtureID).toBeDefined();

        }).catch((err) => {
            console.log(err);
        })

     });

})