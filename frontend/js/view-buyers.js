
document.addEventListener("DOMContentLoaded", () => {
    const buyersTableBody = document.querySelector('#buyersTable tbody');

    // Fetch buyers data from the backend
    fetch('/api/buyers')
        .then(response => response.json())
        .then(data => {
            buyersTableBody.innerHTML = ''; // Clear the existing table content

            data.forEach((buyer, index) => {
                // Correct timezone and format date to dd, mm, yyyy
                const rawDate = new Date(buyer.date_of_purchase); // Create a Date object
                const day = String(rawDate.getDate()).padStart(2, '0');
                const month = String(rawDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                const year = rawDate.getFullYear();
                const formattedDate = `${day}-${month}-${year}`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${buyer.name}</td>
                    <td>${buyer.phone_number}</td>
                    <td>${buyer.amount_sold}</td>
                    <td>${formattedDate}</td>
                    <td>${buyer.disposed_item_id}</td>
                    <td>${buyer.national_number}</td>
                `;
                buyersTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching buyers:', error));
});



// Function to filter the table by national number
function filterTable() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#buyersTable tbody tr');

    rows.forEach(row => {
        const nationalNumberCell = row.cells[6]; // Column 6 is the National Number
        const nationalNumber = nationalNumberCell.textContent.toLowerCase();

        if (nationalNumber.includes(searchInput)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}



