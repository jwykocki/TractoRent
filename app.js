const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { initDb, Machine, Reservation, User } = require('./models/index');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const loginRoutes = require('./routes/login');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressLayouts);
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use('/', loginRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);

app.use((req, res) => {
    res.status(404).render('error', { error: 'Page not found.' });
});

app.use((err, req, res, next) => {
    res.status(500).render('error', { error: err.message });
});

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});
