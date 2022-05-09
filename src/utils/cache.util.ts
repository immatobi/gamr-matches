export enum CacheKeys {
    Roles = 'xpch.roles',
    Anns = 'xpch.announcements',
    Users = 'xpch.users',
    Countries = 'xpch.countries',
    Country = 'xpch.country',
    Languages = 'xpch.languages',
    Language = 'xpch.language',
}

export const computeKey = (env: string | undefined, key: string): string => {
    return env === 'production' ? key + '.prod' : key;
}