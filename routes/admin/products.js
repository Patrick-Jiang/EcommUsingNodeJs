const express = require('express');
const { check, validationResult } = require('express-validator');
const multer = require('multer');

const productsRepo = require('../../repositories/products');
const productNewTemplate = require('../../views/admin/products/new');
const { requirePrice, requireTitle } = require('./validators');

var upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/admin/products', (req, res) => {});
router.get('/admin/products/new', (req, res) => {
  res.send(productNewTemplate({}));
});
router.post(
  '/admin/products/new',
  upload.single('image'),
  [requirePrice, requireTitle],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(productNewTemplate({ errors }));
    }
    const image = req.file.buffer.toString('base64');
    const { title, price } = req.body;
    await productsRepo.create({ title, price, image });
    res.send('submitted');
  }
);
module.exports = router;
