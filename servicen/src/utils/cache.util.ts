export enum CacheKeys {
    Roles = 'chk.roles',
    Anns = 'chk.announcements',
    Users = 'chk.users'
}

export const computeKey = (env: string | undefined, key: string): string => {
    return env === 'production' ? key + '.prod' : key;
}