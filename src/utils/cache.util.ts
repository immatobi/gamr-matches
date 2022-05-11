export enum CacheKeys {
    Roles = 'gamr.roles',
    Anns = 'gamr.announcements',
    Users = 'gamr.users',
    Countries = 'gamr.countries',
    Country = 'gamr.country',
    Languages = 'gamr.languages',
    Language = 'gamr.language',
    Teams = 'gamr.teams',
    Leagues = 'gamr.leagues',
    Fixtures = 'gamr.fixtures',
    Matches = 'gamr.matches',
}

export const computeKey = (env: string | undefined, key: string): string => {
    return env === 'production' ? key + '.prod' : key;
}