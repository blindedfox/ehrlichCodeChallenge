$(() => {
  let USER_CART = [];
  const INVENTORY_ITEMS = [
    {
      id: 1,
      name: `Festive Looks Rust Red Ribbed Velvet Long Sleeve Bodysuit`,
      price: 38,
      img: `festive.png`,
    },
    {
      id: 2,
      name: `Chevron Flap Crossbody Bag`,
      price: 5.77,
      img: `chevron.png`,
    },
    {
      id: 3,
      name: `Manilla Tan Multi Plaid Oversized Fringe Scarf`,
      price: 29,
      img: `manila.png`,
    },
    {
      id: 4,
      name: `Diamante Puff Sleeve Dress - Black`,
      price: 45.99,
      img: `diamante.png`,
    },
    {
      id: 5,
      name: `Banneth Open Front Formal Dress In Black`,
      price: 69,
      img: `banneth.png`,
    },
  ];

  const getItemDetails = async (id) => {
    const itemDetails = INVENTORY_ITEMS.filter(
      (item) => item.id && item.id == id
    );
    return itemDetails;
  };
  const initializeInventory = () => {
    localStorage.setItem('inventory', JSON.stringify(INVENTORY_ITEMS));
  };

  const showToast = async (msg) => {
    console.log(msg);
    $('#toastMsg').html(msg);
    $('#toastComponent').toast('show');
  };

  const fetchCartItems = () => {
    //UI
    let itemCount = USER_CART.length;
    $('#modCartLabel').html(`SHOPPING BAG (${itemCount})`);
    cartItems = localStorage.getItem('cartItems');

    let contents = `<div class="row align-items-start border-bottom border-start border-end p-2">
                      <div class="col-12">
                      <span>Your cart is empty.</span>
                      </div>
                    </div>`;

    if (cartItems) {
      USER_CART = JSON.parse(cartItems);

      $('#modCartItems').html('');
      if (USER_CART.length > 0) {
        contents = '';
        $('#cartBadge').html(USER_CART.length).removeClass('d-none');
        $('#cartButton').removeClass('mx-3').addClass('ms-3');
        $('#cartLabel').html(`SHOPPING BAG (${USER_CART.length})`);
        $('.checkout').removeClass('disabled');
        USER_CART.map((item) => {
          contents += ` <div class="row align-items-start border-bottom border-start p-2">
                          <div class="col-2">
                            <img
                              src="./assets/recently-bought/${item.img}"
                              class="cartImgSize"
                            />
                          </div>
                          <div class="col d-flex flex-column align-items-start">
                            <span class="mb-3">${item.name}</span>
                            <div class="d-flex align-items-center">
                              <span class="me-2">Qty:</span>
                              <input
                                data-itemid="${item.id}"
                                type="number"
                                class="form-control form-control-sm w-50 text-center cartItem"
                                step="1"
                                min="0"
                                value="${item.qty}"
                              />
                              <span data-itemid="${item.id}" class="btn btn-sm btn-danger ms-1 removeItem">Remove</span>
                            </div>
                          </div>
                          <div class="col-3 d-flex justify-content-end">
                            <span><b>$ ${item.totalPrice}</b></span>
                          </div>
                      </div>`;
        });
      } else {
        $('#cartBadge').html('').addClass('d-none');
        $('#cartButton').addClass('mx-3').removeClass('ms-3');
        $('.checkout').addClass('disabled');
      }

      $('#modCartItems').html(contents);

      //Calculate totals and set to interface
      let subTotal = 0;
      let grandTotal = 0;
      let shippingFee = 0;

      USER_CART.map((item) => {
        subTotal += item.totalPrice;
      });

      grandTotal = subTotal + shippingFee;
      $('#subTotal').html('').html(subTotal.toFixed(2));
      $('#grandTotal')
        .html('')
        .html(`$ ${grandTotal.toFixed(2)}`);

      $('.cartItem').on('change', async function () {
        let itemID = $(this).attr('data-itemid');
        let newQty = $(this).val();
        let newTotal = 0;
        const index = USER_CART.map((item) => item.id).indexOf(itemID);

        if (newQty <= 0) {
          let resp = confirm('Remove this item from your cart?');
          console.log(resp);
          if (resp === true) {
            USER_CART.splice(index, 1);
            localStorage.setItem('cartItems', JSON.stringify(USER_CART));
            fetchCartItems();
            console.log(USER_CART);
            showToast('Cart item removed.');
            return false;
          }
        }

        const itemDetails = await getItemDetails(itemID);
        let itemPrice = itemDetails[0].price;

        USER_CART[index].qty = newQty;
        USER_CART[index].totalPrice = itemPrice * newQty;
        localStorage.setItem('cartItems', JSON.stringify(USER_CART));
        fetchCartItems();
      });

      $('.removeItem').on('click', async function () {
        let itemID = $(this).attr('data-itemid');
        const index = USER_CART.map((item) => item.id).indexOf(itemID);
        let resp = confirm('Remove this item from your cart?');
        if (resp === true) {
          USER_CART.splice(index, 1);
          localStorage.setItem('cartItems', JSON.stringify(USER_CART));
          fetchCartItems();
          console.log(USER_CART);
          return false;
        }
      });
    } else {
      $('#modCartItems').html(contents);
      $('.checkout').addClass('disabled');
    }
  };

  const addItemToCart = async (id) => {
    //Get item details
    const itemDetails = await getItemDetails(id);
    let itemPrice = itemDetails[0].price;
    let itemName = itemDetails[0].name;
    let itemImg = itemDetails[0].img;

    //Check if item is already in the cart
    const existingItem = USER_CART.filter((item) => item.id && item.id == id);

    if (existingItem.length > 0) {
      //item is already in the cart, add 1 and update cart.
      const index = USER_CART.map((item) => item.id).indexOf(id);
      USER_CART[index].qty += 1;
      USER_CART[index].totalPrice += itemPrice;
      localStorage.setItem('cartItems', JSON.stringify(USER_CART));
      fetchCartItems();
      showToast('Item added to cart!');
    } else {
      //item is a new entry to the cart
      let newItem = {
        id: id,
        name: itemName,
        img: itemImg,
        qty: 1,
        totalPrice: itemPrice,
      };
      USER_CART.push(newItem);
      localStorage.setItem('cartItems', JSON.stringify(USER_CART));
      fetchCartItems();
      showToast('New item added to cart!');
    }
  };

  const checkoutItems = () => {
    localStorage.removeItem('cartItems');
    $('#modCheckout').modal('show');
  };

  $('.invItem').on('click', function () {
    addItemToCart($(this).attr('data-itemid'));
  });
  $('.viewCart').on('click', function () {
    fetchCartItems();
    $('#modCart').modal('show');
  });
  $('#checkoutButton').on('click', function () {
    checkoutItems();
  });
  $('#checkoutComplete').on('click', function () {
    window.location.replace('index.html');
  });
  $('.logo').on('click', function () {
    window.location.replace('index.html');
  });

  initializeInventory();
  fetchCartItems();
});
