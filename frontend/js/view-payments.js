document.addEventListener("DOMContentLoaded", () => {
    const paymentsTableBody = document.querySelector('#membersTable tbody');

    // Fetch payments data from the backend
    fetch('/api/payments')  // Update the API endpoint
        .then(response => response.json())
        .then(data => {
            // Clear any existing rows
            paymentsTableBody.innerHTML = '';

            // Loop through the fetched payments and create table rows
            data.forEach((payment, index) => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${index + 1}</td> <!-- Serial number -->
                    <td>${payment.national_number}</td>
                    <td>${Math.floor(payment.loan_amount)}</td> <!-- Ensure loan_amount is a whole number -->
                    <td>${Math.floor(payment.interest)}</td> <!-- Interest column -->
                    <td>${Math.floor(payment.total_amount)}</td> <!-- Total Amount column -->
                    
                    <td>${new Date(payment.repayment_date).toLocaleDateString('en-GB')}</td> <!-- Format the date -->

                    <td class="action-buttons">
                        <a href="#" class="delete" data-id="${payment.id}">Delete</a>
                    </td>
                `;

                paymentsTableBody.appendChild(row);
            });
        })

        .catch(error => {
            console.error('Error fetching payments:', error);
        });


    // Add event listener for delete buttons
    paymentsTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete')) {
            event.preventDefault();
            
            const paymentId = event.target.getAttribute('data-id');
            
            // Confirm delete action
            if (confirm('Are you sure you want to delete this payment?')) {
                fetch(`/api/delete_payment/${paymentId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove the deleted payment row from the table
                        event.target.closest('tr').remove();
                    } else {
                        alert('Error deleting payment');
                    }
                })
                .catch(error => {
                    console.error('Error deleting payment:', error);
                });
            }
        }
    });
});


// Script to handle search functionality 
function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('membersTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {  // Start from 1 to skip table header
        const td = tr[i].getElementsByTagName('td')[1]; // Index 2 is the 'National Number' column
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




