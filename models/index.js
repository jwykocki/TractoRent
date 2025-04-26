const sequelize = require('../config/database');
const Machine = require('./Machine');
const User = require('./User');
const Reservation = require('./Reservation');
const bcrypt = require('bcrypt');

// Relacje:
Reservation.belongsTo(Machine, { foreignKey: 'machineId' });
Machine.hasMany(Reservation, { foreignKey: 'machineId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Reservation, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    Machine,
    Reservation,
    User
};

const initDb = async () => {
    await sequelize.sync({ force: true }); // Wyczyści i ponownie stworzy tabelę
    console.log('Successfully initialized database');

    await Machine.bulkCreate([
        { name: 'Tractor', type: 'Vehicle', description: 'green John Deere tractor' },
        { name: 'Combine', type: 'Machine', description: 'new red combine' },
        { name: 'Plow', type: 'Machine', description: 'blue heavy-duty plow' },
        { name: 'Harvester', type: 'Machine', description: 'yellow grain harvester' },
        { name: 'Seeder', type: 'Machine', description: 'white seed planting machine' },
        { name: 'Baler', type: 'Machine', description: 'orange hay baler' }
    ]);

    const hashedFarmerJohnPassword = await bcrypt.hash('john123', 10);
    const hashedFarmAdminPassword = await bcrypt.hash('a', 10);
    const hashedFarmerMikePassword = await bcrypt.hash('mike123', 10);
    const hashedFarmerAnnaPassword = await bcrypt.hash('anna123', 10);
    const hashedFarmerTomPassword = await bcrypt.hash('tom123', 10);
    const hashedFarmerSaraPassword = await bcrypt.hash('sara123', 10);
    const hashedFarmerEmmaPassword = await bcrypt.hash('emma123', 10);

    await User.bulkCreate([
        { username: 'a', password: hashedFarmAdminPassword, email: 'admin@farm.com', role: 'ADMIN' },
        { username: 'john', password: hashedFarmerJohnPassword, email: 'john@farm.com', role: 'USER' },
        { username: 'mike', password: hashedFarmerMikePassword, email: 'mike@farm.com', role: 'USER' },
        { username: 'anna', password: hashedFarmerAnnaPassword, email: 'anna@farm.com', role: 'USER' },
        { username: 'tom', password: hashedFarmerTomPassword, email: 'tom@farm.com', role: 'USER' },
        { username: 'sara', password: hashedFarmerSaraPassword, email: 'sara@farm.com', role: 'USER' },
        { username: 'emma', password: hashedFarmerEmmaPassword, email: 'emma@farm.com', role: 'USER' }
    ]);

    await Reservation.bulkCreate([
        { userId: 1, machineId: 2, date: Date.parse('2025-05-06') },
        { userId: 2, machineId: 3, date: Date.parse('2025-05-12') },
        { userId: 3, machineId: 4, date: Date.parse('2025-05-20') },
        { userId: 4, machineId: 5, date: Date.parse('2025-05-24') },
        { userId: 5, machineId: 6, date: Date.parse('2025-06-04') }
    ]);

};

module.exports = { initDb, Machine, User, Reservation };
