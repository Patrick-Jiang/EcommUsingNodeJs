const express = require('express');

const multer = require('multer');

const productsRepo = require('../../repositories/products');
const productNewTemplate = require('../../views/admin/products/new');
const productIndexTemplate = require('../../views/admin/products/index');
const productEditTemplate = require('../../views/admin/products/edit');
const { requirePrice, requireTitle } = require('./validators');
const { handleErrors, requireAuth } = require('./middlewares');
var upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/admin/products', requireAuth, async (req, res) => {
  const products = await productsRepo.getAll();
  res.send(productIndexTemplate({ products }));
});

router.get('/admin/products/new', requireAuth, (req, res) => {
  res.send(productNewTemplate({}));
});

router.post(
  '/admin/products/new',
  requireAuth,
  upload.single('image'),
  [requirePrice, requireTitle],
  handleErrors(productNewTemplate),
  async (req, res) => {
    const image = req.file.buffer.toString('base64');
    const { title, price } = req.body;
    await productsRepo.create({ title, price, image });
    res.redirect('/admin/products');
  }
);

router.get('/admin/products/:id/edit', requireAuth, async (req, res) => {
  const product = await productsRepo.getOne(req.params.id);
  if (!product) {
    return res.send('Product not found');
  }

  res.send(productEditTemplate({ product }));
});

router.post(
  '/admin/products/:id/edit',
  requireAuth,
  upload.single('image'),
  [requireTitle, requirePrice],
  handleErrors(productEditTemplate, async (req) => {
    const product = await productsRepo.getOne(req.params.id);
    return { product };
  }),
  async (req, res) => {
    const changes = req.body;

    if (req.file) {
      changes.image = req.file.buffer.toString('base64');
    }

    try {
      await productsRepo.update(req.params.id, changes);
    } catch (err) {
      return res.send('Could not find item');
    }

    res.redirect('/admin/products');
  }
);

router.post('/admin/products/:id/delete', requireAuth, async (req, res) => {
  await productsRepo.delete(req.params.id);
  res.redirect('/admin/products');
});

module.exports = router;
