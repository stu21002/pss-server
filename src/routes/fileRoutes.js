// 3rd party imports
const { Router } = require('express');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage })

// Local imports
const { single_upload } = require('../controllers/fileController');


const fileRoutes = Router()
fileRoutes.get('/', (req, res) => {
    res.send('Hello World!');
  });


fileRoutes.post('/upload',upload.single('file') ,single_upload);

module.exports = fileRoutes;
 