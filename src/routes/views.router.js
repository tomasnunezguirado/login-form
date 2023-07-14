import { Router } from "express";
import { ProductManager } from '../dao/managers/products.manager.js';
import { CartManager } from '../dao/managers/carts.manager.js';
const router = Router();

const publicAccess = (req, res, next) => {
    if (req.session.user) return res.redirect('/products');
    next();
}
const privateAccess = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
}

router.get('/register', publicAccess, (req, res) => {
    res.render('register', {title: 'Welcome new Flowerier!!', style: 'login.css'});
})

router.get('/login', publicAccess, (req, res) => {
    res.render('login', {title: 'Hello Flowerier!!', style: 'login.css'});
})

router.get('/resetpassword', publicAccess, (req, res) => {
    res.render('resetPassword', {title: 'Hello Flowerier!! Lets recover your password', style: 'login.css'});
})

router.get('/', privateAccess, (req, res) => {
    res.render('userProfile', {title: 'Flowerier profile', style: 'login.css', user: req.session.user});
})

router.get('/staticProducts', privateAccess, async (req,res)=>{
    const productManager = new ProductManager();
    const products = await productManager.getProducts();
    res.render('home', {title: 'Flowery 4107 Products', style: 'product.css', products: products});
})

router.get('/realtimeproducts', privateAccess, (req,res)=>{
    res.render('realTimeProducts', {title: 'Flowery 4107 Products', style: 'productList.css'});
})

router.get('/webchat', (req,res)=>{
    res.render('chat', { style: 'chat.css', title: 'Flowery 4107 Webchat'});
})

router.get('/products', privateAccess, async (req,res)=>{
    try {
        const { limit = 10, page = 1, sort, category, available } = req.query;
        const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const productManager = new ProductManager();
        const products = await productManager.getProducts(limit, page, sort, category, available, baseUrl);
        res.render('productList', {title: 'Flowery 4107 Products', style: 'productList.css', products: products, user: req.session.user});
    } catch (error) {
        res.status(500).send(error.message);
    }
})

router.get('/carts/:cartId', privateAccess, async (req,res)=>{
    try {
        const cartId = req.params.cartId;
        const cartManager = new CartManager();
        const cart = await cartManager.getCart(cartId);
        res.render('cart', {title: 'Flowery 4107 Cart', style: 'cart.css', cart: cart});
    } catch (error) {
        res.status(500).send(error.message);
    }
})

export default router;