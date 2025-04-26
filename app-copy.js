// const express = require('express');
// const session = require('express-session');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcrypt');
// const { initDb, Machine, Reservation, User } = require('./models/index'); // Make sure User is exported from models
// const { Op } = require('sequelize');
//
// const app = express();
// const PORT = 3000;
//
// // Session configuration
// app.use(session({
//     secret: 'your-secret-key-here', // Change this to a random string
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false } // Set to true if using HTTPS
// }));
// app.set('view engine', 'ejs');
// const expressLayouts = require('express-ejs-layouts');
// app.use(expressLayouts);
// app.use(passport.initialize());
// app.use(passport.session());
// app.set('layout', 'layouts/layout');
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static('public'));
// const flash = require('connect-flash');
// app.use(flash());
// app.use((req, res, next) => {
//     res.locals.currentUser = req.user;
//     res.locals.error = req.flash('error');
//     res.locals.success = req.flash('success');
//     next();
// });
//
//
//
// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/login');
// }
//
// const methodOverride = require('method-override');
// app.use(methodOverride('_method'));
//
//
// // Passport local strategy
// passport.use(new LocalStrategy(
//     async (username, password, done) => {
//         try {
//             const user = await User.findOne({ where: { username } });
//             if (!user) {
//                 return done(null, false, { message: 'Incorrect username.' });
//             }
//
//             const isValidPassword = await bcrypt.compare(password, user.password);
//             if (!isValidPassword) {
//                 return done(null, false, { message: 'Incorrect password.' });
//             }
//
//             return done(null, user);
//         } catch (err) {
//             return done(err);
//         }
//     }
// ));
//
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });
//
// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findByPk(id);
//         done(null, user);
//     } catch (err) {
//         done(err);
//     }
// });
//
// function ensureAdmin(req, res, next) {
//     if (req.isAuthenticated() && req.user.role === 'ADMIN') {
//         return next();
//     }
//     res.status(403).send('Brak dostępu. Musisz być administratorem.');
// }
//
// function validateReservationDate(req, res, next) {
//     const reservationDate = new Date(req.body.date);
//     if (reservationDate < new Date()) {
//         return res.status(400).send('Data rezerwacji musi być w przyszłości');
//     }
//     next();
// }
// app.use((req, res, next) => {
//     res.locals.currentUser = req.user;
//     next();
// });
//
// app.get('/admin-panel', ensureAuthenticated, ensureAdmin, (req, res) => {
//     res.render('admin-panel');
// });
//
//
// app.get('/admin-panel/reservations', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     try {
//         const reservations = await Reservation.findAll({
//             include: [Machine, User], // żeby wyciągnąć maszynę i użytkownika
//         });
//         res.render('admin-reservations', { reservations });
//     } catch (error) {
//         console.error('Error fetching reservations:', error);
//         res.status(500).send('Wystąpił błąd podczas pobierania rezerwacji.');
//     }
// });
//
//
// app.get('/admin-panel/machines/add', ensureAuthenticated, ensureAdmin, (req, res) => {
//     res.render('admin-add-machine'); // Formularz do dodania maszyny
// });
//
// app.post('/admin-panel/machines/add', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     console.log("Request body:", req.body);
//     console.log("Request headers:", req.headers);
//     try {
//         const { name, type, description } = req.body;
//         if (!name || !type || !description) {
//             console.log("Missing fields:", { name, type, description });
//             return res.status(400).send('Wszystkie pola są wymagane');
//         }
//         await Machine.create({ name, type, description });
//         res.redirect('/admin-panel/machines');
//     } catch (error) {
//         console.error('Error adding machine:', error);
//         res.status(500).send('Wystąpił błąd podczas dodawania maszyny.');
//     }
// });
//
// // Zarządzanie maszynami
// app.get('/admin-panel/machines', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     try {
//         const machines = await Machine.findAll();
//         res.render('admin-machines', { machines });
//     } catch (error) {
//         console.error('Error fetching machines:', error);
//         res.status(500).send('Wystąpił błąd podczas pobierania maszyn.');
//     }
// });
//
// // Usuwanie maszyny
// app.post('/admin-panel/machines/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     const machineId = req.params.id;
//     try {
//         const machine = await Machine.findByPk(machineId);
//         if (!machine) {
//             return res.status(404).send('Maszyna nie istnieje.');
//         }
//         await machine.destroy();
//         res.redirect('/admin-panel/machines');
//     } catch (error) {
//         console.error('Error deleting machine:', error);
//         res.status(500).send('Wystąpił błąd podczas usuwania maszyny.');
//     }
// });
//
// app.post('/admin-panel/reservations/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     const reservationId = req.params.id;
//     try {
//         const reservation = await Reservation.findByPk(reservationId);
//         if (!reservation) {
//             return res.status(404).send('Rezerwacja nie istnieje.');
//         }
//         await reservation.destroy();
//         res.redirect('/admin-panel/reservations');
//     } catch (error) {
//         console.error('Error deleting reservation:', error);
//         res.status(500).send('Wystąpił błąd podczas usuwania rezerwacji.');
//     }
// });
//
// app.get('/admin-panel/reservations/add', ensureAuthenticated, ensureAdmin, (req, res) => {
//     res.render('admin-add-reservation');
// });
//
// app.post('/admin-panel/reservations/add',
//     ensureAuthenticated,
//     validateReservationDate,
//     ensureAdmin,
//     async (req, res) => {
//         try {
//             const { machineId, userId, date } = req.body;
//
//             const [existing, machine] = await Promise.all([
//                 Reservation.findOne({ where: { machineId, date } }),
//                 Machine.findByPk(machineId)
//             ]);
//
//             if (existing) {
//                 return res.status(400).render('new-reservation', {
//                     machine,
//                     error: 'Maszyna jest już zarezerwowana na ten dzień.'
//                 });
//             }
//
//             const reservation = await Reservation.create({
//                 userId,
//                 machineId,
//                 date
//             });
//
//             res.render('reservation-created', { reservation });
//         } catch (error) {
//             console.error(error);
//             res.status(500).render('error', { error: 'Wystąpił błąd podczas tworzenia rezerwacji' });
//         }
//     }
// );
//
// // Routes
// app.get('/', (req, res) => {
//     res.render('index');
// });
//
// // Auth Routes
// app.get('/register', (req, res) => {
//     res.render('register',  { error: null });
// });
//
// app.post('/register', async (req, res) => {
//     try {
//         const { username, password, email } = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10);
//
//         const user = await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             role: 'USER'
//         });
//
//         req.login(user, (err) => {
//             if (err) {
//                 return res.redirect('/register');
//             }
//             return res.redirect('/');
//         });
//     } catch (error) {
//         console.error(error);
//         res.render('register', { error: 'Registration failed. Username may be taken.' });
//     }
// });
//
// app.get('/login', (req, res) => {
//     res.render('login', { error: req.flash('error') });
// });
//
//
// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }));
//
//
// app.get('/logout', (req, res, next) => {
//     req.logout(function(err) {
//         if (err) { return next(err); }
//         res.redirect('/');
//     });
// });
//
//
//
// app.get('/reservations', ensureAuthenticated, async (req, res) => {
//     try {
//         console.log("TODO role validation here ")
//         const reservations = await Reservation.findAll();
//
//         res.render('reservations', {
//             reservations
//         });
//     } catch (error) {
//         console.error('Error fetching  all reservations:', error);
//         res.status(500).send('Error fetching all reservations');
//     }
// });
//
// app.get('/machines', async (req, res) => {
//     const machines = await Machine.findAll();
//     res.render('machines', { machines });
// });
//
// app.get('/machines/:id', async (req, res) => {
//     const machineId = req.params.id;
//
//     const machine = await Machine.findByPk(machineId);
//     if (!machine) {
//         return res.status(404).send('Maszyna nie istnieje');
//     }
//
//     const today = new Date();
//     const threeMonthsLater = new Date();
//     threeMonthsLater.setMonth(today.getMonth() + 3);
//
//     const reservations = await Reservation.findAll({
//         where: {
//             machineId: machineId,
//             date: {
//                 [Op.between]: [today, threeMonthsLater]
//             }
//         },
//         order: [['date', 'ASC']]
//     });
//
//     const reservedDates = reservations.map(r => r.date);
//
//     res.render('machine-availability', {
//         machine,
//         reservedDates,
//         startDate: today.toISOString().split('T')[0],
//         endDate: threeMonthsLater.toISOString().split('T')[0]
//     });
// });
//
// // DELETE reservation
// app.post('/reservations/:id', ensureAuthenticated, async (req, res) => {
//     const reservationId = req.params.id;
//     const userId = req.user.id; // Użytkownik zalogowany
//
//     try {
//         // Szukamy rezerwacji
//         const reservation = await Reservation.findByPk(reservationId);
//
//         if (!reservation) {
//             return res.status(404).send('Rezerwacja nie istnieje.');
//         }
//
//         // Sprawdzenie czy rezerwacja należy do użytkownika
//         if (reservation.userId !== userId) {
//             return res.status(403).send('Nie masz uprawnień do usunięcia tej rezerwacji.');
//         }
//
//         // Usuwamy rezerwację
//         await reservation.destroy();
//
//         // Po usunięciu - przekierowanie do listy rezerwacji
//         res.redirect('/reservations/user');
//     } catch (error) {
//         console.error('Error deleting reservation:', error);
//         res.status(500).send('Wystąpił błąd podczas usuwania rezerwacji.');
//     }
// });
//
//
//
// app.get('/reservations/new/:machineId', ensureAuthenticated, async (req, res) => {
//
//         const userId = req.user.id; // Get the logged-in user's ID
//         const machineId = req.params.machineId;
//         const machine = await Machine.findByPk(machineId);
//
//         if (!machine) {
//             return res.status(404).send('Maszyna nie istnieje');
//         }
//
//
//     res.render('new-reservation', { machine, userId });
// });
//
// app.get('/reservations/user', ensureAuthenticated, async (req, res) => {
//     const userId = req.user.id;
//     const reservations = await Reservation.findAll({
//         where: { userId },
//         include: Machine
//     });
//
//     res.render('user-reservations', { reservations });
// });
//
//
//
// app.post('/reservations',
//     ensureAuthenticated,
//     validateReservationDate,
//     async (req, res) => {
//         try {
//             const { machineId, date } = req.body;
//             const userId = req.user.id;
//
//             const [existing, machine] = await Promise.all([
//                 Reservation.findOne({ where: { machineId, date } }),
//                 Machine.findByPk(machineId)
//             ]);
//
//             if (existing) {
//                 return res.status(400).render('new-reservation', {
//                     machine,
//                     error: 'Maszyna jest już zarezerwowana na ten dzień.'
//                 });
//             }
//
//             const reservation = await Reservation.create({
//                 userId,
//                 machineId,
//                 date
//             });
//
//             res.render('reservation-created', { reservation });
//         } catch (error) {
//             console.error(error);
//             res.status(500).render('error', { error: 'Wystąpił błąd podczas tworzenia rezerwacji' });
//         }
//     }
// );
//
// app.get('/admin-panel/machines', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     try {
//         const machines = await Machine.findAll();
//         res.render('admin-machines', { machines });
//     } catch (error) {
//         console.error('Error fetching machines:', error);
//         res.status(500).send('Wystąpił błąd podczas pobierania maszyn.');
//     }
// });
//
// app.get('/admin-panel/machines/add', ensureAuthenticated, ensureAdmin, (req, res) => {
//     res.render('add-machine');
// });
//
// app.post('/admin-panel/machines/add', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     try {
//         const { name, type, description } = req.body;
//         await Machine.create({ name, type, description });
//         res.redirect('/admin-panel/machines');
//     } catch (error) {
//         console.error('Error adding machine:', error);
//         res.status(500).send('Wystąpił błąd podczas dodawania maszyny.');
//     }
// });
//
// app.get('/admin-panel/machines/edit/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     try {
//         const machine = await Machine.findByPk(req.params.id);
//
//         if (!machine) {
//             return res.status(404).send('Maszyna nie istnieje.');
//         }
//
//         res.render('admin-edit-machine', { machine });
//     } catch (error) {
//         console.error('Error fetching machine:', error);
//         res.status(500).send('Wystąpił błąd podczas pobierania maszyny.');
//     }
// });
//
// app.post('/admin-panel/machines/edit/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     try {
//         const { name, type, description } = req.body;
//         const machine = await Machine.findByPk(req.params.id);
//
//         if (!machine) {
//             return res.status(404).send('Maszyna nie istnieje.');
//         }
//
//         await machine.update({ name, type, description });
//         res.redirect('/admin-panel/machines');
//     } catch (error) {
//         console.error('Error updating machine:', error);
//         res.status(500).send('Wystąpił błąd podczas edycji maszyny.');
//     }
// });
//
// app.post('/admin-panel/machines/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
//     try {
//         const machine = await Machine.findByPk(req.params.id);
//
//         if (!machine) {
//             return res.status(404).send('Maszyna nie istnieje.');
//         }
//
//         await machine.destroy();
//         res.redirect('/admin-panel/machines');
//     } catch (error) {
//         console.error('Error deleting machine:', error);
//         res.status(500).send('Wystąpił błąd podczas usuwania maszyny.');
//     }
// });
//
//
//
//
//
//
//
// app.use((req, res) => {
//     res.status(404).render('error', { error: 'Strona nie została znaleziona' });
// });
//
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).render('error', { error: err.message });
// });
//
//
// initDb().then(() => {
//     app.listen(PORT, () => {
//         console.log(`Server is running on http://localhost:${PORT}`);
//     });
// });
