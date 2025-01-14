

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        alert('No item selected for payment.');
        return;
    }

    try {
        // Fetch disposed item details
        const response = await fetch(`/api/disposed-items/${itemId}`);
        if (!response.ok) {
            throw new Error('Item not found');
        }
        const item = await response.json();

        // Log the fetched item to check the structure
        console.log(item);

        // Display item details
        const disposedItemDetailsDiv = document.getElementById('disposedItemDetails');

        disposedItemDetailsDiv.innerHTML = `
            <p><span class="label">Name:</span> ${item.name}</p>
            <p><span class="label">National Number:</span> ${item.national_number}</p>
            <p><span class="label">Total Amount to Repay:</span> ${item.total_amount_repayable || 'N/A'}</p>
        `;
    } catch (error) {
        console.error('Error fetching disposed item:', error);
        alert('An error occurred while fetching the disposed item.');
    }
});
