async function displayItem() {
    const itemId = new URLSearchParams(window.location.search).get('id');
    if (!itemId) {
        console.error('Item ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/api/items/${itemId}`);
        const item = await response.json();

        const ratings = await fetch(`/api/reviews/average/${itemId}`);
        const avgRating = await ratings.json();
        let rating = '';

        if (avgRating.rating === null || avgRating.rating === 0) {
            rating = 'No ratings yet';
        } else {
            for (let i = 0; i < Math.floor(avgRating.rating); i++) {
                rating += '⭐';
            }
        }

        const imageContainer = document.querySelector('.item-image-container');
        const infoContainer = document.querySelector('.item-info-container');

        imageContainer.innerHTML = `<img src="${item.image_url}" alt="${item.name}" class="item-image" />`;
        infoContainer.innerHTML = `
            <h1>${item.name}</h1>
            <p>${rating}</p>
            <p>${item.description}</p>
            <p>Price: $${item.price}</p>
            <button id="addToCartBtn">Add to Cart</button>
            `;

        const addToCartBtn = document.getElementById('addToCartBtn');
        addToCartBtn.addEventListener('click', async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('log in to add items to cart');
                    return;
                }

                const decoded = JSON.parse(atob(token.split('.')[1]));
                const userId = decoded.id;

                //temp add quantity button
                const quantity = 1;
                const response = await fetch('/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId: item.id, quantity, userId})
                });

                if (response.ok) {
                    alert('Item added to cart!');
                    window.location.href = '/cart.html';
                } else {
                    const error = await response.json();
                    console.error('Error adding item to cart:', error.message);
                    alert('Failed to add item to cart. Please try again.');
                }
            } catch (error) {
                console.error('Error adding item to cart:', error);
            }
        });
        displayReviews(itemId);
        const reviewForm = document.getElementById('reviewForm');
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to submit a review.');
                return;
            }

            const decoded = JSON.parse(atob(token.split('.')[1]));
            const userId = decoded.id;

            const rating = document.getElementById('rating').value;
            const comment = document.getElementById('comment').value;

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId: itemId, customerId: userId, rating, comment }),
                });

                if (response.ok) {
                    alert('Review submitted successfully!');
                    reviewForm.reset();
                    displayReviews(itemId); // Refresh the reviews section
                } else {
                    const error = await response.json();
                    console.error('Error submitting review:', error.message);
                    alert('Failed to submit review. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting review:', error);
            }
        });
        displayRelatedItems(itemId);
    } catch (error) {
        console.error('Error fetching item:', error);
    }
}

async function displayReviews(itemId) {
    try {
        const response = await fetch(`/api/reviews/${itemId}`);
        const reviews = await response.json();

        const reviewsContainer = document.getElementById('reviewsContainer');
        reviewsContainer.innerHTML = '<h2>Reviews</h2>';

        if (reviews.length === 0) {
            reviewsContainer.innerHTML += '<p>No reviews yet</p>';
            return;
        }

        reviews.sort((a, b) => new Date(b.review_date) - new Date(a.review_date));
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            const rating = '⭐'.repeat(review.rating);

            reviewElement.classList.add('review');
            reviewElement.innerHTML = `
                <p>by ${review.username}</p>
                <p>rating: ${rating}</p>
                <p>${review.comment}</p>
                `;
            reviewsContainer.appendChild(reviewElement);
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

async function displayRelatedItems(itemId) {
    try {
        const response = await fetch(`/api/items/related/${itemId}`);
        const relatedItems = await response.json();

        const relatedItemsContainer = document.getElementById('relatedItemsContainer');

        if (relatedItems.length === 0) {
            relatedItemsContainer.innerHTML += '<p>No related items found</p>';
            return;
        }

        const itemsContainer = document.createElement('div');
        itemsContainer.classList.add('item-container');

        relatedItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item');
            itemElement.innerHTML = `
                <h4>${item.name}</h4>
                <img src="${item.image_url}" alt="${item.name}" class="item-image" />
                <h4>Price: $${item.price}</h4>
                `;
            itemElement.addEventListener('click', () => {
                window.location.href = `/item.html?id=${item.id}`;
            });
            itemsContainer.appendChild(itemElement);
        });

        relatedItemsContainer.appendChild(itemsContainer);
    } catch (error) {
        console.error('Error fetching related items:', error);
    }
}

displayItem();
