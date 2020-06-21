const mongoDb = require('mongodb');
const getBd = require('../util/database').getDb;

const ObjectID = mongoDb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart; // {items: [] }
    this._id = id;
  }

  save() {
    const db = getBd();

    return db
    .collection('users')
    .insertOne(this);
  }

  addToCart(product) {
    const db = getBd();
    const cartProductIndex = this.cart.items.findIndex(cp => {

      return cp.productId && cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updateCartItems = [ ...this.cart.items];

    if(cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updateCartItems[cartProductIndex].quantity = newQuantity
    } else {
      updateCartItems.push(       
        {
          productId: new ObjectID(product._id) ,
          quantity: newQuantity,
        }
      )
    }

    const updatedCart = {
      items: updateCartItems,
    };
 
    return db.collection('users').updateOne(
        { _id: new ObjectID(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    const db =getBd();
    const productIds = this.cart.items.map(item => {
      return item.productId;
    } );
    return db
      .collection('products')
      .find({_id: {$in: productIds}})
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(i => {
              return i.productId && i.productId.toString() === p._id.toString();
            }).quantity
          }
        })
      })
  }

  deleteItemFromCart(productId) {
    const db = getBd();
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());

    return db.collection('users').updateOne(
      { _id: new ObjectID(this._id) },
      { $set: { cart: { items: updatedCartItems } } }
    );
  }

  addOrder() {
    const db = getBd();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: new ObjectID(this._id),
            name: this.name,
          }
        }

        return db
        .collection('orders')
        .insertOne(order)
      })
      .then(result => {
        this.cart = {items: [] };

        db.collection('users').updateOne(
          { _id: new ObjectID(this._id) },
          { $set: { cart: { items: [] } } }
        );
      })
  }

  getOrders() {
    const db = getBd();

    return db.collection('orders').find({'user._id': new ObjectID(this._id)}).toArray()
  }

  static findById(userId) {
    const db = getBd();

    return db
    .collection('users')
    .findOne({_id: mongoDb.ObjectId(userId)})
    .then(user => {
      return user;
    })
    .catch(console.log)
  }
}

module.exports = User;