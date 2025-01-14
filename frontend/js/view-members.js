

document.addEventListener("DOMContentLoaded", () => {
    const membersTableBody = document.querySelector('#membersTable tbody');

    // Fetch members data from the backend
    fetch('/api/members')
        .then(response => response.json())
        .then(data => {
            // Clear any existing rows
            membersTableBody.innerHTML = '';

            // Loop through the fetched members and create table rows
            data.forEach((member, index) => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${index + 1}</td> <!-- Serial number -->
                    <td>${member.name}</td>
                    <td>${member.national_number}</td>
                    <td>${member.phone_number}</td>
                    <td>${Math.floor(member.loan_amount)}</td> <!-- Ensure loan_amount is a whole number -->
                    <td>${member.loan_duration}</td>
                    <td>${member.guarantee_item}</td>
                    <td>${new Date(member.loan_issue_date).toLocaleDateString('en-GB')}</td> <!-- Format the date to dd/mm/yyyy -->
                    <td class="paid-status">${member.paid_status}</td> <!-- Added class to paid status -->
                    <td class="action-buttons">
                        <a href="/payment.html?id=${member.id}" class="view">Pay</a>
                        <a href="#" class="delete" data-id="${member.id}">Delete</a>
                    </td>
                `;


                // If the status is "Paid", color it red
                if (member.paid_status === "Paid") {
                    row.querySelector('.paid-status').style.color = "#f4462e"; // Set color to green
                } else if (member.paid_status === "Disposed") {
                    row.querySelector('.paid-status').style.color = "#f82408"; // Set color to green
                }

                membersTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching members:', error);
        });

    // Add event listener for delete buttons
    membersTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete')) {
            event.preventDefault();
            
            const memberId = event.target.getAttribute('data-id');
            
            // Confirm delete action
            if (confirm('Are you sure you want to delete this member?')) {
                fetch(`/api/delete_member/${memberId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove the deleted member row from the table
                        event.target.closest('tr').remove();
                    } else {
                        alert('Error deleting member');
                    }
                })
                .catch(error => {
                    console.error('Error deleting member:', error);
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

