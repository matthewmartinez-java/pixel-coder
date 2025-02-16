async function displayOrders() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to view your orders');
        return;
    }

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.id;

    try {
        const response = await fetch(`/api/orders?userId=${userId}`);
        const orders = await response.json();
        console.log(orders);

        const ordersContainer = document.getElementById('ordersContainer');
        ordersContainer.innerHTML = '';

        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p>No orders found</p>';
            return;
        }

        const orderCardsContainer = document.createElement('div');
        orderCardsContainer.classList.add('order-cards-container');

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('order-card');
            orderCard.innerHTML = `
                <h3>Order ID: ${order.id}</h3>
                <p>Order Date: ${order.order_date}</p>
                <p>Total Amount: $${order.total_amount}</p>
                <div class="order-items-container">
                <h4>Order Items:</h4>
                ${order.items.map(item => `
                    <div class="order-item">
                    <p>${item.name}</p>
                    <p>Q:${item.quantity}</p>
                    <p>P:$${item.price}</p>
                    </div>
                    `).join('')}
                </div>
                <div class="payment-details">
                <h4>Payment Details:</h4>
                <p>Address: ${order.address}</p>
                <p>Payment Type: ${order.payment_type}</p>
                </div>
                `;
            orderCardsContainer.appendChild(orderCard);
        });

        ordersContainer.appendChild(orderCardsContainer);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

displayOrders();
