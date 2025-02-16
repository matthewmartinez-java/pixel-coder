async function displayItems(category, containerId) {
    try {
        const response = await fetch(`/api/items/${category}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Invalid response format. Expected an array.');
            return;
        }

        const container = document.getElementById(containerId);
        container.innerHTML = '';

        data.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item');
            itemElement.innerHTML = `
                <h4>${item.name}</h4>
                <img src="${item.image_url}" alt="${item.name}" class="item-image" />
                <h4>Price: ${item.price}</h4>
                `;
            itemElement.addEventListener('click', () => {
                window.location.href = `/item.html?id=${item.id}`;
            });
            container.appendChild(itemElement);
        });
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

displayItems('recommended', 'recommendedContainer');
displayItems('community-picks', 'communityPicksContainer');
displayItems('trending', 'trendingContainer');
