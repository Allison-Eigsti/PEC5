const express = require('express');
const listingController = require('../controllers/listingController');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { enforceRequestSize, uploadImages } = require('../middleware/upload');

const router = express.Router();

router.get('/', listingController.listListings);
router.get('/mine', requireAuth, listingController.getMyListings);
router.get('/:id', optionalAuth, listingController.getListing);

router.post(
  '/',
  requireAuth,
  enforceRequestSize,
  uploadImages,
  listingController.createListing,
);

router.patch(
  '/:id',
  requireAuth,
  enforceRequestSize,
  uploadImages,
  listingController.updateListing,
);

router.delete('/:id', requireAuth, listingController.hideListing);

module.exports = router;
