const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    uploadPhotos,
    deletePhoto,
    getUpcomingTrials,
    getUpcomingDeliveries,
    getOrderStats
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/multer');

// All routes are protected
router.use(protect);

// Stats and upcoming routes (must be before /:id)
router.get('/stats', getOrderStats);
router.get('/upcoming/trials', getUpcomingTrials);
router.get('/upcoming/deliveries', getUpcomingDeliveries);

// Main CRUD routes
router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrder)
    .put(updateOrder)
    .delete(deleteOrder);

// Photo routes
router.post('/:id/photos', upload.array('photos', 10), uploadPhotos);
router.delete('/:id/photos/:photoIndex', deletePhoto);

module.exports = router;
