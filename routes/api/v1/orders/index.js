const expressJson = require('express').json();
const router = require('express').Router();
const bodyParser = require('body-parser');
const Dinero = require('dinero.js');
const dotenv = require('dotenv');

dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ENDPOINT_SECRET = process.env.STRIPE_ENDPOINT_SECRET;

const {
  validatePlaceOrder
} = require('./validate.js');
const { Order, Product, DiscountCode } = require('../../../../models');

router.get('/test', (req, res) => {
  return res.json({ message: 'orders' });
});

router.post('/', expressJson, async (req, res) => {
  /*
   *
   * INPUT
   * =====
   * - name
   * - email
   * - phoneNumber
   * - addressLine1
   * - addressLine2 (optional)
   * - city
   * - state
   * - postalCode
   * - productId
   * - discountCode (optional)
   * 
   */
  try {
    // Validate input
    const error = validatePlaceOrder(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    // Check if product exists
    const product = await Product.findOne({
      where: {
        id: req.body.productId,
        isAvailable: true,
        isPublic: true
      }
    });
    if (!product) {
      return res.status(400).json({ message: 'Invalid product' });
    }

    let discountCode = null;
    if (req.body.discountCode) {
      // Check if discount code exists
      discountCode = await DiscountCode.findOne({ where: { code: req.body.discountCode } });

      if (!discountCode) {
        return res.status(400).json({ message: 'Invalid discount code' });
      }
    }

    const finalProduct = {
      name: product.name,
      subtotal: product.salePrice,
      discount: 0,
      total: product.salePrice
    };

    if (discountCode) {
      finalProduct.discountCode = discountCode.code;
      finalProduct.discountPercentage = discountCode.discountPercentage;
      // const discount = (discountCode.discountPercentage / 100) * product.salePrice;
      // finalProduct.discount = discount;
      // finalProduct.total = product.salePrice - discount;
      const discount = Dinero({ amount: product.salePrice }).multiply(discountCode.discountPercentage / 100);
      finalProduct.discount = discount.getAmount();
      const total = Dinero({ amount: product.salePrice }).subtract(discount);
      finalProduct.total = total.getAmount();
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalProduct.total,
      currency: 'myr',
      shipping: {
        name: req.body.name,
        address: {
          line1: req.body.addressLine1,
          line2: req.body.addressLine2 ? req.body.addressLine2 : '',
          city: req.body.city,
          state: req.body.state,
          postal_code: req.body.postalCode,
          country: 'my'
        }
      },
      receipt_email: req.body.email
    });

    const orderToBePlaced = {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2 ? req.body.addressLine2 : '',
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country,
      productName: finalProduct.name,
      subtotal: finalProduct.subtotal,
      discount: finalProduct.discount,
      total: finalProduct.total,
      discountCode: finalProduct.discountCode,
      discountPercentage: finalProduct.discountPercentage,
      stripePaymentIntentId: paymentIntent.id
    };

    const order = Order.build({ ...orderToBePlaced });

    const savedOrder = await order.save();

    const dataPayload = {
      order: savedOrder,
      clientSecret: paymentIntent.client_secret
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log('[ ERROR: POST /api/v1/orders ]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.orderId }
    });

    if (!order) {
      return res.status(404).json({ message: 'Invalid order ID' });
    }

    const dataPayload = {
      order: {
        id: order.id,
        status: order.status,
        orderPlacedAt: order.orderPlacedAt,
        paymentCompletedAt: order.paymentCompletedAt,
        shippedAt: order.shippedAt,
        canceledAt: order.canceledAt,
        carrier: order.carrier,
        trackingNumber: order.trackingNumber
      }
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log('[ ERROR: GET /api/v1/orders/:orderId ]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, ENDPOINT_SECRET);
  } catch (error) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  switch (event.type) {
    case 'payment_intent.canceled' : {
      console.log('payment_intent.canceled');
      break;
    }

    case 'payment_intent.created' : {
      console.log('-----');
      console.log('payment_intent.created');
      // console.log(event.data);
      console.log('-----');
      break;
    }

    case 'payment_intent.payment_failed' : {
      console.log('payment_intent.payment_failed');
      break;
    }

    case 'payment_intent.processing' : {
      console.log('payment_intent.processing');
      break;
    }

    case 'payment_intent.requires_action' : {
      console.log('payment_intent.requires_action');
      break;
    }

    case 'payment_intent.succeeded' : {
      console.log('-----');
      console.log('payment_intent.succeeded');
      // console.log(event.data.object);
      console.log('-----');
      // Check if product exists
      const order = await Order.findOne({
        where: {
          stripePaymentIntentId: event.data.object.id
        }
      });

      if (!order) {
        return res.status(400).send(`Webhook error`);
      }

      if (order.status === 'awaiting_payment') {
        order.status = 'preparing_for_shipment';
        order.paymentCompletedAt = Date.now();
        const savedOrder = await order.save();
        console.log(savedOrder);
      }

      break;
    }

    case 'payment_method.attached' : {
      console.log('payment_intent.created');
      break;
    }
  }

  res.status(200);
});

module.exports = router;
