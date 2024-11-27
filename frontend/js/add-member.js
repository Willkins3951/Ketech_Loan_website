
//   MAIN JS FILE


document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const name = document.querySelector('input[name="name"]').value;
        const national_number = document.querySelector('input[name="national_number"]').value;
        const phone_number = document.querySelector('input[name="phone_number"]').value; // New phone number field
        const loan_amount = document.querySelector('input[name="loan_amount"]').value;
        const loan_duration = document.querySelector('input[name="loan_duration"]').value; // New loan duration field
        const guarantee_item = document.querySelector('input[name="guarantee_item"]').value; // Moved guarantee item        
        const loan_issue_date = document.querySelector('input[name="loan_issue_date"]').value;
        const paid_status = document.querySelector('select[name="paid_status"]').value;

        // Basic validation
        if (!name || !national_number || !phone_number || !loan_amount || !loan_duration || !guarantee_item || !loan_issue_date) {
            alert('Please fill in all fields.');
            return;
        }

        const memberData = {
            name,
            national_number,
            phone_number,  // Included in data submission
            loan_amount,
            loan_duration, // Included in data submission
            guarantee_item,
            loan_issue_date,
            paid_status
        };

        try {
            // Send member data to backend
            const response = await fetch('/add_member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });

            if (response.ok) {
                alert('Member added successfully!');
                window.location.href = "/view-members.html"; // Redirect to view members page
            } else {
                const error = await response.json();
                alert(`Error adding member: ${error.message}`);
            }
        } catch (err) {
            console.error('Error during adding member:', err);
            alert('An error occurred. Please try again later.');
        }
    });
});

