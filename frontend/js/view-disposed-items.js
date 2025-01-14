

document.addEventListener("DOMContentLoaded", () => {
    const disposedItemsTableBody = document.querySelector('#disposedItemsTable tbody');

    // Fetch disposed items data
    fetch('/api/disposed-items')
        .then(response => response.json())
        .then(data => {
            disposedItemsTableBody.innerHTML = '';

            data.forEach((item, index) => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.national_number}</td>
                    <td>${item.loan_amount}</td>
                    <td>${item.loan_duration}</td>
                    <td>${item.interest}</td>
                    <td>${item.total_amount_repayable}</td>
                    <td>${item.status}</td>
                    <td class="btns">
                        <button class="pay" data-id="${item.id}">Pay</button>
                        <button class="delete" data-id="${item.id}">Delete</button>
                    </td>
                `;

                disposedItemsTableBody.appendChild(row);
            });

            // Add event listener to "Pay" buttons
            document.querySelectorAll('.pay').forEach(button => {
                button.addEventListener('click', (event) => {
                    const itemId = event.target.getAttribute('data-id');
                    window.location.href = `/disposed-items-payment.html?id=${itemId}`;
                });
            });

            // Add event listener to "Delete" buttons
            document.querySelectorAll('.delete').forEach(button => {
                button.addEventListener('click', (event) => {
                    const itemId = event.target.getAttribute('data-id');
                    
                    if (confirm('Are you sure you want to delete this item?')) {
                        // Send DELETE request to server
                        fetch(`/api/delete_disposed_item/${itemId}`, {
                            method: 'DELETE',
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // Remove the deleted item row from the table
                                event.target.closest('tr').remove();
                                alert('Item deleted successfully');
                            } else {
                                alert('Error deleting item');
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting item:', error);
                            alert('Error deleting item');
                        });
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching disposed items:', error);
        });
});


// Script to handle search functionality 

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('disposedItemsTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {  // Start from 1 to skip table header
        const td = tr[i].getElementsByTagName('td')[2]; // Index 2 is the 'National Number' column
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = '';
            } else {
                tr[i].style.display = 'none';
            }
        }
    }
}
