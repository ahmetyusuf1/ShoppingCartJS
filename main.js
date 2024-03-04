const cartBtn = document.querySelector(".cart-btn");
// console.log(cartBtn);

const clearCartBtn = document.querySelector(".btn-clear");
// console.log(clearCartBtn);

const cartItems = document.querySelector(".cart-items");
// console.log(cartItems);

const cartTotal = document.querySelector(".total-value");
// console.log(cartTotal);

const cartContent = document.querySelector(".cart-list");
// console.log(cartContent);

const productsDOM = document.querySelector("#products-dom");
// console.log(productsDOM);

let buttonsDOM = new Array();
let cart = new Array();

class Products {
  async getProducts() {
    try {
      let result = await fetch(
        "https://65e44f4a3070132b3b24867b.mockapi.io/products"
      );
      let data = await result.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayProducts(data) {
    let result = "";
    data.forEach((item) => {
      const { id, price, image, title } = item;
      result += `<div class="col-lg-4 col-md-6">
            <div class="product">
              <div class="product-image">
                <img src=${image} />
              </div>
              <div class="product-hover">
                <span class="product-title">${title}</span>
                <span class="product-price">${price}$</span>
                <button class="btn-add-to-cart" data-id=${id}>
                  <i class="fa-solid fa-cart-shopping"></i>
                </button>
              </div>
            </div>
          </div>`;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.setAttribute("disabled", "disabled");
        button.opacity = ".3";
      } else {
        button.addEventListener("click", (event) => {
          event.target.disabled = true;
          event.target.style.opacity = ".3";
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.saveCartValues(cart);
          this.addCartItem(cartItem);
          this.showCart();
        });
      }
    });
  }

  saveCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const { id, image, title, price, amount } = item;
    const list = document.createElement("li");
    list.classList.add("cart-list-item");
    list.innerHTML = `<div class="cart-left">
    <div class="cart-left-image">
      <img src=${image} />
    </div>
    <div class="cart-left-info">
      <a class="cart-left-info-title" href="#">${title}</a>
      <span class="cart-left-info-price">${price} $</span>
    </div>
  </div>
  <div class="cart-right">
    <div class="cart-right-quantity">
      <button class="quantity-minus" data-id=${id}>
        <i class="fa-solid fa-minus"></i>
      </button>
      <span class="quantity">${amount}</span>
      <button class="quantity-plus" data-id=${id}>
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
    <div class="cart-right-remove">
      <button class="cart-remove-btn" data-id=${id}>
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  </div>`;
    cartContent.appendChild(list);
  }

  showCart() {
    cartBtn.click();
  }

  setupApp() {
    cart = Storage.getCart();
    this.saveCartValues(cart);
    this.populateCart(cart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("cart-remove-btn")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        removeItem.parentElement.parentElement.parentElement.remove();
        this.removeItem(id);
      } else if (event.target.classList.contains("quantity-minus")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.saveCartValues(cart);
          lowerAmount.nextElementSibling.innerText = tempItem.amount;
        } else {
          lowerAmount.parentElement.parentElement.parentElement.remove();
          this.removeItem(id);
        }
      } else if (event.target.classList.contains("quantity-plus")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.saveCartValues(cart);
        addAmount.previousElementSibling.innerText = tempItem.amount;
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.saveCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.style.opacity = "1";
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(data) {
    localStorage.setItem("products", JSON.stringify(data));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.setupApp();

  products
    .getProducts()
    .then((data) => {
      ui.displayProducts(data);
      Storage.saveProducts(data);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
