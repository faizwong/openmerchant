require('dotenv').config();

const router = require('express').Router();

const { Product, GalleryImage } = require('../../../../models');

const storageBucketUrl = process.env.STORAGE_BUCKET_URL;

router.get('/test', (req, res) => {
  return res.json({ message: 'products' });
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isPublic: true }
    });

    const transformedProducts = products.map((item) => ({
      id: item.id,
      name: item.name,
      regularPrice: item.regularPrice,
      salePrice: item.salePrice,
      shortDescription: item.shortDescription,
      longDescription: item.longDescription,
      isAvailable: item.isAvailable,
      isPublic: item.isPublic,
      imageFileName: `${storageBucketUrl}/${item.imageFileName}`
    }));

    const dataPayload = {
      products: transformedProducts
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log('[ ERROR: /api/v1/products ]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.productId, isPublic: true },
      include: {
        model: GalleryImage
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Invalid product id' });
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      isAvailable: product.isAvailable,
      isPublic: product.isPublic,
      imageFileName: `${storageBucketUrl}/${product.imageFileName}`,
      GalleryImages: product.GalleryImages.map((item) => ({
        id: item.id,
        ProductId: item.ProductId,
        imageFileName: `${storageBucketUrl}/${item.imageFileName}`
      }))
    };

    const dataPayload = {
      product: transformedProduct
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log('[ ERROR: /api/v1/products ]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
