function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'ADMIN') {
        return next();
    }
    res.status(403).send('Access denied. Admins only.');
}

function validateReservationDate(req, res, next) {
    const reservationDate = new Date(req.body.date);
    if (reservationDate < new Date()) {
        return res.status(400).send('Reservation date must be in the future.');
    }
    next();
}


module.exports = { ensureAuthenticated, ensureAdmin, validateReservationDate };
