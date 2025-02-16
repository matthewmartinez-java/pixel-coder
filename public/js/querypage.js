document.addEventListener('DOMContentLoaded', function() {
    const queryContainer = document.getElementById('queryContainer');

    const searchParams = new URLSearchParams(window.location.search);
    const searchTerm = searchParams.get('search');
    const filterCategory = searchParams.get('filter');

    if (searchTerm) {
        searchItems(searchTerm);
    } else if (filterCategory) {
        filterItems(filterCategory);
    }

    async function searchItems(searchTerm, page = 1, limit = 16) {
        try {
            const response = await fetch(`/api/items/search?term=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`);
            const data = await response.json();
            displayResults(data, `Search results for "${searchTerm}"`);
        } catch (error) {
            console.error('Error searching items:', error);
        }
    }

    async function filterItems(category, page = 1, limit = 16) {
        try {
            const response = await fetch(`/api/items/filter?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`);
            const data = await response.json();
            displayResults(data, `Items in ${category}`);
        } catch (error) {
            console.error('Error filtering items:', error);
        }
    }

    function displayResults(items, searchContext = 'Results') {
        const headingElement = document.getElementById('resultsHeading');
        const itemsContainer = document.createElement('div');
        itemsContainer.classList.add('item-container');

        if (!Array.isArray(items) || items.length === 0) {
            headingElement.textContent = `${searchContext} not found`;
            return;
        }

        headingElement.textContent = searchContext;
        queryContainer.innerHTML = '';

        items.forEach(item => {
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
            itemsContainer.appendChild(itemElement);
        });

        queryContainer.appendChild(itemsContainer);
    }


    let currentPage = 1;
    const limit = 15;

    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            if (searchTerm) {
                searchItems(searchTerm, currentPage, limit);
            } else if (filterCategory) {
                filterItems(filterCategory, currentPage, limit);
            }
        }
    });

    nextPageButton.addEventListener('click', () => {
        currentPage++;
        if (searchTerm) {
            searchItems(searchTerm, currentPage, limit);
        } else if (filterCategory) {
            filterItems(filterCategory, currentPage, limit);
        }
    });

});
