import { Router } from "express";
import { CartManager } from "../dao/managers/carts.manager.js";

const cartManager = new CartManager();

const router = Router();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).send({ status: 1, msg: 'Cart added successfully', cartId: newCart._id });
    } catch (error) {
        res.status(500).send({ status: 0, msg: error.message });
    }
});

router.get('/:cartId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cart = await cartManager.getCart(cartId);
        res.json({ status: 1, cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:cartId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const products = req.body.products;
        const cart = await cartManager.addProductsToCart(cartId, products)
        res.status(201).send({ status: 1, msg: 'Cart updated successfully', cartProducts: cart.products });
    } catch (error) {
        res.status(500).send({ status: 0, msg: error.message });
    }
});

router.post('/:cartId/products/:productId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.productId;
        const cart = await cartManager.addToCart(cartId, productId);
        res.status(201).send({ status: 1, msg: 'Product added to cart successfully', cart });
    } catch (error) {
        res.status(500).send({ status: 0, msg: error.message });
    }
});

router.delete('/:cartId/products/:productId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.productId;
        const cart = await cartManager.removeFromCart(cartId, productId);
        res.status(201).send({ status: 1, msg: 'Product deleted from cart successfully', cart });
    } catch (error) {
        res.status(500).send({ status: 0, msg: error.message });
    }
});

router.put('/:cartId/products/:productId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.productId;
        const quantity = req.body.quantity;
        const cart = await cartManager.updateProductQuantity(cartId, productId, quantity);
        res.status(201).send({ status: 1, msg: 'Product quantity updated successfully', cart });
    } catch (error) {
        res.status(500).send({ status: 0, msg: error.message });
    }
});

router.delete('/:cartId', async (req, res) => {
    const cartId = req.params.cartId;

    try {
        const emptiedCart = await cartManager.emptyCart(cartId);
        res.status(201).send({ status: 1, msg: 'Cart successfully emptied', cart: emptiedCart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
