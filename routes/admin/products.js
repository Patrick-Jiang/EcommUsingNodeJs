const express = require('express');

const multer = require('multer');

const productsRepo = require('../../repositories/products');
const productNewTemplate = require('../../views/admin/products/new');
const productIndexTemplate = require('../../views/admin/products/index');
const { requirePrice, requireTitle } = require('./validators');
const { handleErrors } = require('./middlewares');
var upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/admin/products', async (req, res) => {
  const products = await productsRepo.getAll();
  res.send(productIndexTemplate({ products }));
});

router.get('/admin/products/new', (req, res) => {
  res.send(productNewTemplate({}));
});

router.post(
  '/admin/products/new',
  upload.single('image'),
  [requirePrice, requireTitle],
  handleErrors(productNewTemplate),
  async (req, res) => {
    const image = req.file.buffer.toString('base64');
    const { title, price } = req.body;
    await productsRepo.create({ title, price, image });
    res.send('submitted');
  }
);

module.exports = router;
