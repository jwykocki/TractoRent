const express = require('express');
const router = express.Router();
const { Machine, Reservation, User } = require('../models/index');
const { ensureAuthenticated, ensureAdmin, validateReservationDate } = require('../middlewares/auth');
const { Op } = require('sequelize');

router.use(ensureAuthenticated, ensureAdmin);

router.get('/admin-panel', (req, res) => {
    res.render('admin/admin-panel');
});

router.get('/admin-panel/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.findAll({ include: [Machine, User] });
        res.render('admin/admin-reservations', { reservations });
    } catch (error) {
        res.status(500).send('Error fetching reservations.');
    }
});

router.get('/admin-panel/reservations/add', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render('admin/admin-add-reservation');
});

router.post('/admin-panel/reservations/add',
    ensureAuthenticated,
    validateReservationDate,
    ensureAdmin,
    async (req, res) => {
        try {
            const { machineId, userId, date } = req.body;

            const [existing, machine] = await Promise.all([
                Reservation.findOne({ where: { machineId, date } }),
                Machine.findByPk(machineId)
            ]);

            if (existing) {
                return res.status(400).render('new-reservation', {
                    machine,
                    error: 'Machine already reserved that day.'
                });
            }

            const reservation = await Reservation.create({
                userId,
                machineId,
                date
            });

            res.render('reservation-created', { reservation });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', { error: 'Error during reservation creation' });
        }
    }
);


router.post('/admin-panel/reservations/delete/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);
        if (!reservation) {
            return res.status(404).send('Reservation not found.');
        }
        await reservation.destroy();
        res.redirect('admin/admin-panel/reservations');
    } catch (error) {
        res.status(500).send('Error deleting reservation.');
    }
});

router.get('/admin-panel/machines', async (req, res) => {
    try {
        const machines = await Machine.findAll();
        res.render('admin/admin-machines', { machines });
    } catch (error) {
        res.status(500).send('Error fetching machines.');
    }
});

router.get('/admin-panel/machines/add', (req, res) => {
    res.render('admin/admin-add-machine');
});

router.post('/admin-panel/machines/add', async (req, res) => {
    try {
        const { name, type, description } = req.body;
        await Machine.create({ name, type, description });
        res.redirect('admin/admin-panel/machines');
    } catch (error) {
        res.status(500).send('Error adding machine.');
    }
});

router.get('/admin-panel/machines/edit/:id', async (req, res) => {
    try {
        const machine = await Machine.findByPk(req.params.id);
        if (!machine) {
            return res.status(404).send('Machine not found.');
        }
        res.render('admin/admin-edit-machine', { machine });
    } catch (error) {
        res.status(500).send('Error fetching machine.');
    }
});

router.post('/admin-panel/machines/edit/:id', async (req, res) => {
    try {
        const { name, type, description } = req.body;
        const machine = await Machine.findByPk(req.params.id);
        if (!machine) {
            return res.status(404).send('Machine not found.');
        }
        await machine.update({ name, type, description });
        res.redirect('admin/admin-panel/machines');
    } catch (error) {
        res.status(500).send('Error updating machine.');
    }
});

router.post('/admin-panel/machines/delete/:id', async (req, res) => {
    try {
        const machine = await Machine.findByPk(req.params.id);
        if (!machine) {
            return res.status(404).send('Machine not found.');
        }
        await machine.destroy();
        res.redirect('admin/admin-panel/machines');
    } catch (error) {
        res.status(500).send('Error deleting machine.');
    }
});

module.exports = router;
