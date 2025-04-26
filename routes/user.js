const express = require('express');
const router = express.Router();
const { Machine, Reservation } = require('../models/index');
const { ensureAuthenticated, validateReservationDate } = require('../middlewares/auth');
const { Op } = require('sequelize');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/machines', async (req, res) => {
    const machines = await Machine.findAll();
    res.render('machines', { machines });
});

router.get('/machines/:id', async (req, res) => {
    const machine = await Machine.findByPk(req.params.id);
    if (!machine) {
        return res.status(404).send('Machine not found.');
    }

    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const reservations = await Reservation.findAll({
        where: {
            machineId: machine.id,
            date: {
                [Op.between]: [today, threeMonthsLater]
            }
        },
        order: [['date', 'ASC']]
    });

    const reservedDates = reservations.map(r => r.date);

    res.render('machine-availability', {
        machine,
        reservedDates,
        startDate: today.toISOString().split('T')[0],
        endDate: threeMonthsLater.toISOString().split('T')[0]
    });
});

router.get('/reservations', ensureAuthenticated, async (req, res) => {
    const reservations = await Reservation.findAll();
    res.render('reservations', { reservations });
});

router.get('/reservations/new/:machineId', ensureAuthenticated, async (req, res) => {
    const machine = await Machine.findByPk(req.params.machineId);
    if (!machine) {
        return res.status(404).send('Machine not found.');
    }
    res.render('new-reservation', { machine, userId: req.user.id });
});

router.post('/reservations', ensureAuthenticated, validateReservationDate, async (req, res) => {
    try {
        const { machineId, date } = req.body;
        const userId = req.user.id;

        const [existing, machine] = await Promise.all([
            Reservation.findOne({ where: { machineId, date } }),
            Machine.findByPk(machineId)
        ]);

        if (existing) {
            return res.status(400).render('new-reservation', {
                machine,
                error: 'The machine is already reserved for that date.'
            });
        }

        const reservation = await Reservation.create({ userId, machineId, date });
        res.render('reservation-created', { reservation });
    } catch (error) {
        res.status(500).render('error', { error: 'An error occurred while creating the reservation.' });
    }
});


router.get('/reservations/user', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const reservations = await Reservation.findAll({
        where: { userId: userId },
        include: {
            model: Machine
        }
    });

    res.render('user-reservations', { reservations });
});


router.post('/reservations/:id', ensureAuthenticated, async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);
        if (!reservation) {
            return res.status(404).send('Reservation not found.');
        }
        if (reservation.userId !== req.user.id) {
            return res.status(403).send('You are not authorized to delete this reservation.');
        }
        await reservation.destroy();
        res.redirect('/reservations/user');
    } catch (error) {
        res.status(500).send('Error deleting reservation.');
    }
});

module.exports = router;
