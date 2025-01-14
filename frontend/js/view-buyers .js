
document.addEventListener("DOMContentLoaded", () => {
    const disposedItemsTableBody = document.querySelector('#buyersTable tbody');

    // Fetch disposed items data
    fetch('/api/buyers')
        .then(response => response.json())
        .then(data => {
            disposedItemsTableBody.innerHTML = '';

            data.forEach((item, index) => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${buyer.name}</td>
                    <td>${buyer.phone_number}</td>
                    <td>${buyer.amount_sold}</td>
                    <td>${buyer.Item_purchased_id}</td>
                    <td>${buyer.date_of_purchase}</td>
                    
                `;

                buyersTableBody.appendChild(row);
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
    const table = document.getElementById('buyersTable');
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