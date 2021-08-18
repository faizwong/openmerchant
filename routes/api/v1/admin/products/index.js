require('dotenv').config();

const router = require('express').Router();
const expressJson = require('express').json();

const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const path = require('path');

const sharp = require('sharp');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const PutObjectCommand = require('@aws-sdk/client-s3').PutObjectCommand;
const DeleteObjectCommand = require('@aws-sdk/client-s3').DeleteObjectCommand;
const DeleteObjectsCommand = require('@aws-sdk/client-s3').DeleteObjectsCommand;
const s3Client = require('../../../../../libs/s3Client.js').s3Client;

const bucketName = process.env.AWS_BUCKET_NAME;
const storageBucketUrl = process.env.STORAGE_BUCKET_URL;

const authenticateJWT = require('../../../../../middlewares/authenticateJWT');
const { validateCreate, validateUploadImage } = require('./validate.js');
const {
  Admin,
  GalleryImage,
  Product
} = require('../../../../../models');

router.get('/test', (req, res) => {
  return res.json({ message: 'admin/products' });
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const itemsPerPage = 25;
    let totalItems;
    let totalPages;
    let currentPage;
    let offset = 0;
    let currentPageSize;
    
    let page = 1;
    if (req.query && Object.keys(req.query).length !== 0 && req.query.constructor === Object) {
      if (req.query.page) {
        page = parseInt(req.query.page, 10);
      } else {
        return res.status(420).json({ message: 'Bad input' });
      }
    }
    offset = parseInt(page, 10) * itemsPerPage - itemsPerPage;

    const { count, rows } = await Product.findAndCountAll({
      limit: itemsPerPage,
      offset: offset,
      order: [
        ['id', 'ASC']
      ]
    });

    totalItems = count;
    totalPages = Math.ceil(count / itemsPerPage);
    currentPage = page;
    currentPageSize = rows.length;

    const transformedProducts = rows.map((item) => ({
      id: item.id,
      name: item.name,
      regularPrice: item.regularPrice,
      salePrice: item.salePrice,
      shortDescription: item.shortDescription,
      longDescription: item.longDescription,
      isAvailable: item.isAvailable,
      isPublic: item.isPublic,
      imageFileName: `${storageBucketUrl}/${item.imageFileName}`,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    const dataPayload = {
      products: transformedProducts,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: currentPage,
        currentPageSize: currentPageSize
      }
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/:productId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const product = await Product.findOne({
      where: { id: req.params.productId },
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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
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
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/', [expressJson, authenticateJWT], async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Validate input
    const error = validateCreate(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    const product = Product.build({
      name: req.body.name,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      regularPrice: req.body.regularPrice,
      salePrice: req.body.salePrice,
      isAvailable: req.body.isAvailable,
      isPublic: req.body.isPublic
    });

    const savedProduct = await product.save();

    const dataPayload = savedProduct;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.put('/:productId', [expressJson, authenticateJWT], async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Validate input
    const error = validateCreate(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    const product = await Product.findOne({ where: { id: req.params.productId } });
    if (!product) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    product.name = req.body.name;
    product.shortDescription = req.body.shortDescription;
    product.longDescription = req.body.longDescription;
    product.regularPrice = req.body.regularPrice;
    product.salePrice = req.body.salePrice;
    product.isAvailable = req.body.isAvailable;
    product.isPublic = req.body.isPublic;

    const savedProduct = await product.save();

    const dataPayload = savedProduct;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/:productId/change-image', [upload.single('file'), authenticateJWT], async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Validate input
    const error = validateUploadImage(req);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    const product = await Product.findOne({ where: { id: req.params.productId } });
    if (!product) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const productOldImageFileName = product.imageFileName;

    const file = req.file;

    const fileExtension = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
    const fileName = `${product.id}-${Date.now()}.${fileExtension}`;
    const bucketFilePath = 'product-images/';

    try {
      await sharp(file.path)
      .resize(2000, 2000, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(
        path.resolve(file.destination, fileName)
      );
      await unlinkFile(file.path);
    } catch (error) {
      await unlinkFile(file.path);
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong' });
    }

    const uploadFileName = `${bucketFilePath}${fileName}`;
    const fileStream = fs.createReadStream(path.resolve(file.destination, fileName));

    const uploadParams = {
      Bucket: bucketName,
      Key: uploadFileName,
      Body: fileStream,
      ACL: 'public-read'
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      await unlinkFile(path.resolve(file.destination, fileName));
    } catch (error) {
      await unlinkFile(path.resolve(file.destination, fileName));
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong' });
    }

    product.imageFileName = uploadFileName;

    const savedProduct = await product.save();

    if (productOldImageFileName !== 'product-images/default.jpg') {
      const deleteParams = {
        Bucket: bucketName,
        Key: productOldImageFileName
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    }

    const transformedSavedProduct = {
      ...savedProduct.dataValues,
      imageFileName: `${storageBucketUrl}/${savedProduct.dataValues.imageFileName}`
    };

    const dataPayload = transformedSavedProduct;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/:productId/add-gallery-image', [upload.single('file'), authenticateJWT], async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Validate input
    const error = validateUploadImage(req);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    const product = await Product.findOne({
      where: { id: req.params.productId },
      include: {
        model: GalleryImage
      }
    });
    if (!product) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    if (product.GalleryImages.length >= 9) {
      return res.status(400).json({ message: 'Product can only have a maximum of 9 gallery images' });
    }

    const galleryImage = GalleryImage.build({
      ProductId: product.id
    });

    const newGalleryImage = await GalleryImage.create({
      ProductId: product.id
    });

    const file = req.file;

    const fileExtension = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
    const fileName = `${newGalleryImage.id}-${Date.now()}.${fileExtension}`;
    const bucketFilePath = 'gallery-images/';

    try {
      await sharp(file.path)
      .resize(2000, 2000, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(
        path.resolve(file.destination, fileName)
      );
      await unlinkFile(file.path);
    } catch (error) {
      await unlinkFile(file.path);
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong' });
    }

    const uploadFileName = `${bucketFilePath}${fileName}`;
    const fileStream = fs.createReadStream(path.resolve(file.destination, fileName));

    const uploadParams = {
      Bucket: bucketName,
      Key: uploadFileName,
      Body: fileStream,
      ACL: 'public-read'
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      await unlinkFile(path.resolve(file.destination, fileName));
    } catch (error) {
      await unlinkFile(path.resolve(file.destination, fileName));
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong' });
    }

    await GalleryImage.update(
      { imageFileName: uploadFileName },
      { where: { id: newGalleryImage.id } }
    );

    const updatedProduct = await Product.findOne({
      where: { id: req.params.productId },
      include: {
        model: GalleryImage
      }
    });

    const transformedUpdatedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      regularPrice: updatedProduct.regularPrice,
      salePrice: updatedProduct.salePrice,
      shortDescription: updatedProduct.shortDescription,
      longDescription: updatedProduct.longDescription,
      isAvailable: updatedProduct.isAvailable,
      isPublic: updatedProduct.isPublic,
      imageFileName: `${storageBucketUrl}/${updatedProduct.imageFileName}`,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
      GalleryImages: updatedProduct.GalleryImages.map((item) => ({
        id: item.id,
        ProductId: item.ProductId,
        imageFileName: `${storageBucketUrl}/${item.imageFileName}`
      }))
    };

    const dataPayload = transformedUpdatedProduct;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/:productId/delete-gallery-image/:galleryImageId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const product = await Product.findOne({
      where: { id: req.params.productId },
      include: {
        model: GalleryImage,
        where: { id: req.params.galleryImageId }
      }
    });
    if (!product) {
      return res.status(400).json({ message: 'Invalid product or gallery image id' });
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: product.GalleryImages[0].imageFileName
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    const galleryImage = await GalleryImage.findOne({
      where: { id: product.GalleryImages[0].id }
    });
    if (!galleryImage) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    try {
      await galleryImage.destroy();
    } catch (error) {
      galleryImage.imageFileName = 'gallery-images/default.jpg';
      await galleryImage.save();
    }

    const updatedProduct = await Product.findOne({
      where: { id: req.params.productId },
      include: {
        model: GalleryImage
      }
    });

    const transformedUpdatedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      regularPrice: updatedProduct.regularPrice,
      salePrice: updatedProduct.salePrice,
      shortDescription: updatedProduct.shortDescription,
      longDescription: updatedProduct.longDescription,
      isAvailable: updatedProduct.isAvailable,
      isPublic: updatedProduct.isPublic,
      imageFileName: `${storageBucketUrl}/${updatedProduct.imageFileName}`,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
      GalleryImages: updatedProduct.GalleryImages.map((item) => ({
        id: item.id,
        ProductId: item.ProductId,
        imageFileName: `${storageBucketUrl}/${item.imageFileName}`
      }))
    };

    const dataPayload = transformedUpdatedProduct;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.delete('/:productId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const product = await Product.findOne({
      where: { id: req.params.productId },
      include: {
        model: GalleryImage
      }
    });
    if (!product) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const objectsToDelete = [];

    objectsToDelete.push({
      Key: product.imageFileName
    });

    for (let i = 0; i < product.GalleryImages.length; i++) {
      objectsToDelete.push({
        Key: product.GalleryImages[i].imageFileName
      });
    }

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: objectsToDelete
      }
    };
    await s3Client.send(new DeleteObjectsCommand(deleteParams));

    await product.destroy();

    return res.json({
      message: 'success'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/:productId/test', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.productId },
      include: {
        model: GalleryImage
      }
    });
    if (!product) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const dataPayload = product;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
