const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// CRUD Resources
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', resourceController.createResource);
router.put('/:id', resourceController.updateResource);
router.patch('/:id', resourceController.partialUpdateResource);
router.delete('/:id', resourceController.deleteResource);

module.exports = router;