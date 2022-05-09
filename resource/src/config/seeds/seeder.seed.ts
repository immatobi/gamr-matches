import { seedBanks, cacheBanks } from './bank.seed';
import { seedCountry, cacheCountries } from './country.seed';
import { seedLanguages, cacheLanguages } from './language.seeder';
import { seedCoins, cacheCoins } from './coin.seeder';

export const seedData = async () => {

    await seedCountry();
    await seedBanks();
    await seedLanguages();
    await seedCoins();

    // cache
    await cacheCountries('d');
    await cacheBanks('d');
    await cacheLanguages('d');
    await cacheCoins('d');

}

export default seedData;