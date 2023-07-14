import fs from 'fs';
import shortid from 'shortid';
import { ProductManager } from './product.managerFs.js';

const productManager = new ProductManager('./src/data/products.json');

class CartManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.carts = [];
  }

  initialize = async () => {
    if (fs.existsSync(this.filePath)) {
      const data = await fs.promises.readFile(this.filePath, 'utf8');
      this.carts = JSON.parse(data);
    } else {
      this.carts = [];
    }
  }

  save = async () => {
    await fs.promises.writeFile(this.filePath, JSON.stringify(this.carts, null, '\t'));
  }

  createCart = async () => {
    await this.initialize();
    const cartId = shortid.generate();
    const newCart = {
      id: cartId,
      products: []
    };
    this.carts.push(newCart);
    await this.save();
    return newCart;
  }

  getCart = async (cartId) => {
    if (!shortid.isValid(cartId)) throw new Error('Invalid Cart ID');
    await this.initialize();
    const cart = this.carts.find((cart) => cart.id === cartId);
    if (!cart) throw new Error('Cart not found');
    return cart;
  }

  addToCart = async (cartId, productId) => {
    if (!shortid.isValid(cartId)) throw new Error('Invalid Cart ID');
    await this.initialize();
    const cart = this.carts.find((cart) => cart.id === cartId);
    if (!cart) throw new Error('Cart not found');
    if (!productId) throw new Error('Product ID is required');
    if (!shortid.isValid(productId)) throw new Error('Invalid Product ID');
    try {
        const product = await productManager.getProductById(productId);
    } catch (error) {
        throw new Error(error.message);
    }
    const existingProduct = cart.products.find((product) => product.productId === productId);
    if (existingProduct) {
      existingProduct.qty += 1;
    } else {
      const newProduct = {
        productId: productId,
        qty: 1
      };
      cart.products.push(newProduct);
    }
    await this.save();
    return cart;
  }

  deleteFromCart = async (cartId, productId) => {
    if (!shortid.isValid(cartId)) throw new Error('Invalid Cart ID');
    await this.initialize();
    const cart = this.carts.find((cart) => cart.id === cartId);
    if (!cart) throw new Error('Cart not found');
    if (!productId) throw new Error('Product ID is required');
    if (!shortid.isValid(productId)) throw new Error('Invalid Product ID');
    const product = cart.products.find((product) => product.productId === productId);
    if (!product) throw new Error('Product not in cart');
    product.qty -= 1;
    if (product.qty <= 0) {
      // Eliminar el producto del array de productos del carrito
      cart.products = cart.products.filter((product) => product.productId !== productId);
    }
    await this.save();
    return cart;
  }

}

export { CartManager };
