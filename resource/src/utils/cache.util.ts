
export enum CacheKeys {
    Assets = 'xpch.assets',
    Asset = 'xpch.asset',
    Banks = 'xpch.banks',
    Bank = 'xpch.bank',
    Countries = 'xpch.countries',
    Country = 'xpch.country',
    Languages = 'xpch.languages',
    Language = 'xpch.language',
    Locations = 'xpch.locations',
    Location = 'xpch.location',
    Coins = 'xpch.coins',
    Coin = 'xpch.coin',
}

export const computeKey = (env: string | undefined, key: string): string => {
    return env === 'production' ? key + '.prod' : key;
}