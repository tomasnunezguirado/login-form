import CartsModel from '../models/carts.model.js';
import ProductsModel from '../models/products.model.js';

class CartManager {
  constructor() {
    this.cartModel = CartsModel;
    this.productModel = ProductsModel;
  }

  createCart = async () => {
    try {
      const newCart = await this.cartModel.create({ products: [] });
      return newCart;
    } catch (error) {
      throw new Error(`Failed to add cart: ${error.message}`);
    }
  }

  getCart = async (cartId) => {
    try {
      const cart = await this.cartModel.findById(cartId).lean();
      if (!cart) {
        throw new Error('Cart not found');
      }
      return cart;
    } catch (error) {
      throw new Error(`Failed to retrieve cart: ${error.message}`);
    }
  }

  addToCart = async (cartId, productId) => {
    try {
      const cart = await this.cartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      if (!productId) {
        throw new Error('Product ID is required');
      }
      const product = await this.productModel.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      const existingProduct = cart.products.find((product) => product.product._id.toString() === productId);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ product: product, quantity: 1 })
      }
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Failed to add product to cart: ${error.message}`);
    }
  }

  removeFromCart = async (cartId, productId) => {
    try {
      const cart = await this.cartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      if (!productId) {
        throw new Error('Product ID is required');
      }
      const existingProduct = cart.products.find((product) => product.product._id.toString() === productId);
      if (!existingProduct) {
        throw new Error('Product not found in cart');
      }
      existingProduct.quantity -= 1;
      if (existingProduct.quantity === 0) {
        cart.products = cart.products.filter((product) => product.product._id.toString() !== productId);
      }
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Failed to remove product from cart: ${error.message}`);
    }
  }

  updateProductQuantity = async (cartId, productId, quantity) => {
    try {
      const cart = await this.cartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      if (!productId) {
        throw new Error('Product ID is required');
      }
      const existingProduct = cart.products.find((product) => product.product._id.toString() === productId);
      if (!existingProduct) {
        throw new Error('Product not found in cart');
      }
      if (!quantity) {
        throw new Error('Quantity is required');
      }
      if (quantity <= 0) {
        throw new Error('Quantity cannot be zero or negative');
      }
      existingProduct.quantity = quantity;
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Failed to update product quantity: ${error.message}`);
    }
  }

  emptyCart = async (cartId) => {
    try {
      const cart = await this.cartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      cart.products = [];
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Failed to empty cart: ${error.message}`);
    }
  }

  addProductsToCart = async (cartId, products) => {
    try {
      const cart = await this.cartModel.findById(cartId);
      if (!cart) {
        throw new Error('Cart not found');
      }
      if (!products || !Array.isArray(products) || products.length === 0) {
        throw new Error('Invalid product list');
      }
      const existingProducts = cart.products.map((product) => product.product._id.toString());
      const productsToAdd = [];
      const productsToUpdate = [];
      for (const productData of products) {
        const { productId, quantity } = productData;
        if (!productId) {
          throw new Error('Product ID is required');
        }
        if (!quantity || quantity <= 0) {
          throw new Error('Invalid quantity');
        }
        const product = await this.productModel.findById(productId);
        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }
        if (existingProducts.includes(productId)) {
          const existingProduct = cart.products.find((product) => product.product._id.toString() === productId);
          existingProduct.quantity += quantity;
          productsToUpdate.push(existingProduct);
        } else {
          productsToAdd.push({ product: product, quantity: quantity });
        }
      }
      cart.products.push(...productsToAdd);
      for (const product of productsToUpdate) {
        await product.save({ suppressWarning: true }); 
      }
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Failed to add products to cart: ${error.message}`);
    }
  }
}

export { CartManager };