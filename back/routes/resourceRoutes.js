const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { validateResource } = require('../middlewares/validateResource');
const { validatePartialResource } = require('../middlewares/validatePartialResource');

router.post('/', validateResource, resourceController.createResource);
router.post('/update/:id', validatePartialResource, resourceController.updateResource);
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.delete('/:id', resourceController.deleteResource);

//router.post('/assign', resourceController.assignResource);
router.post('/as', resourceController.assignResourcesToPatient);




router.delete('/remove/:patientId/:resourceId', resourceController.removeResourceFromPatient);



module.exports = router;
