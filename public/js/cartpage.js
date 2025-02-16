const checkoutButton = document.getElementById('checkoutButton');
const checkoutModal = document.getElementById('checkoutModal');
const closeButton = document.getElementsByClassName('close')[0];
const checkoutForm = document.getElementById('checkoutForm');

checkoutButton.addEventListener('click', openModal);
closeButton.addEventListener('click', closeModal);
checkoutForm.addEventListener('submit', processCheckout);

function openModal() {
    checkoutModal.style.display = 'block';
}

function closeModal() {
    checkoutModal.style.display = 'none';
}

async function processCheckout(event) {
    event.preventDefault();

    const fullname = document.getElementById('fullname').value;
    let address = document.getElementById('address').value;
    const paymentType = document.getElementById('paymentType').value;

    address = `${fullname}, ${address}`;

    try {
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;

        const response = await fetch('/api/orders/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, address, paymentType }),
        });

        if (response.ok) {
            alert('Order placed successfully!');
            window.location.reload();
        } else {
            console.error('Error processing checkout');
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
    }
}

async function displayCartItems() {
    try {
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;

        const response = await fetch(`/api/cart?userId=${userId}`);
        const cartItems = await response.json();

        const cartItemsContainer = document.getElementById('cartItemsContainer');
        cartItemsContainer.innerHTML = '';

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<h2>Your cart is empty</h2>';
            checkoutButton.style.display = 'none';
            return;
        }

        let totalPrice = 0;
        cartItems.forEach(item => {
            totalPrice += item.price * item.quantity;
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('item');
            cartItemElement.innerHTML = `
                <h4>${item.name}</h4>
                <img src="${item.image_url}" alt="${item.name}" class="item-image" />
                <h4>Price: $${item.price}</h4>
                <h4>Quantity: ${item.quantity}</h4>
                </div>
                `;
            cartItemsContainer.appendChild(cartItemElement);
            const removeButton = document.createElement('button');
            removeButton.innerHTML = 'Remove Item';
            removeButton.addEventListener('click', () => removeItem(item.id));
            cartItemElement.appendChild(removeButton);
        });

        displayCartSummary(cartItems, totalPrice);
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

function displayCartSummary(cartItems, totalPrice) {
    const cartSummary = document.getElementById('cartSummary');
    let tax = totalPrice * 0.1;
    let total = totalPrice + tax;
    cartSummary.innerHTML = `
        <p>Quantity: ${cartItems.length}</p>
        <p>Subtotal: $${totalPrice.toFixed(2)}</p>
        <p>Tax: $${tax.toFixed(2)}</p>
        <\hr>
        <h4>Total: $${total.toFixed(2)}</h4>
        `;
}

async function removeItem(itemId) {
    try {
        const response = await fetch(`/api/cart/${itemId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            displayCartItems();
        } else {
            console.error('Error removing item from cart');
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
    }
}

displayCartItems();
