document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        alert('No item selected for payment.');
        return;
    }

    try {
        const response = await fetch(`/api/disposed-items/${itemId}`);
        if (!response.ok) throw new Error('Item not found');
        const item = await response.json();

        document.getElementById('disposedItemDetails').innerHTML = `
            <p><span class="label">Name:</span> ${item.name}</p>
            <p><span class="label">National Number:</span> ${item.national_number}</p>
            <p><span class="label">Total Amount to Repay:</span> ${item.total_amount_repayable || 'N/A'}</p>
        `;

        document.getElementById('payButton').addEventListener('click', async (e) => {
            e.preventDefault();

            const buyerName = document.getElementById('buyerName').value;
            const buyerPhone = document.getElementById('buyerPhone').value;
            const amountSold = document.getElementById('amountSold').value;
            const paymentDate = document.getElementById('paymentDate').value;

            if (!buyerName || !buyerPhone || !amountSold || !paymentDate) {
                alert('All fields are required.');
                return;
            }

            try {
                const response = await fetch(`/api/disposed-items/${itemId}/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name: buyerName, 
                        phone_number: buyerPhone, 
                        amount_sold: amountSold, 
                        date_of_purchase: paymentDate 
                    })
                });
                const result = await response.json();

                if (result.success) {
                    alert('Payment completed. Status updated.');
                    window.location.href = '/view-buyers.html';
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error during payment:', error);
                alert('An error occurred while processing the payment.');
            }
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        alert('An error occurred while fetching the item details.');
    }
});

