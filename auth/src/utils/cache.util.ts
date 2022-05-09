export enum CacheKeys {
    Roles = 'xpch.roles',
    Anns = 'xpch.announcements',
    Users = 'xpch.users'
}

export const computeKey = (env: string | undefined, key: string): string => {
    return env === 'production' ? key + '.prod' : key;
}