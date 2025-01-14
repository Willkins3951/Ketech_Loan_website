
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    // Fetch member details
    const memberResponse = await fetch(`/members/${memberId}`);      
    const member = await memberResponse.json();

    // Display member details
    const memberDetailsDiv = document.getElementById('memberDetails');

    // Format the loan issue date using toLocaleDateString
    const loanIssueDate = new Date(member.loan_issue_date);
    const formattedLoanIssueDate = loanIssueDate.toLocaleDateString('en-GB'); // Formats as DD/MM/YYYY

    memberDetailsDiv.innerHTML = `
        <p><span class="label">Name:</span> ${member.name}</p>
        <p><span class="label">National Number:</span> ${member.national_number}</p>
        <p><span class="label">Loan Amount:</span> ${member.loan_amount}</p>
        <p><span class="label">Loan Issue Date:</span> ${formattedLoanIssueDate}</p>
        <p><span class="label">Guarantee Item:</span> ${member.guarantee_item}</p>
    `;

    // Handle the calculate button click
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', () => {
        const repaymentDate = document.getElementById('repaymentDate').value;

        if (!repaymentDate) {
            alert('Please select a repayment date.');
            return;
        }

        try {
            const loanAmount = Number(member.loan_amount); // Get loan amount

            // Calculate the difference in milliseconds
            const issueDate = new Date(member.loan_issue_date);
            const repaymentDateObj = new Date(repaymentDate);
            const timeDifference = repaymentDateObj - issueDate;

            // Calculate the number of full weeks (if any part of a week has passed, count as one full week)
            const weeksPassed = Math.ceil((timeDifference - 1000 * 60 * 60 * 24) / (1000 * 60 * 60 * 24 * 7));

            // Calculate interest at 12% per week
            const interest = loanAmount * 0.12 * weeksPassed; // Calculate interest
            const totalRepayment = loanAmount + interest; // Calculate total repayment

            // Ensure both values are valid numbers
            if (isNaN(totalRepayment) || isNaN(interest)) {
                throw new Error('Invalid repayment data received.');
            }

            const calculationResultsDiv = document.getElementById('calculationResults');
            calculationResultsDiv.innerHTML = `
                <p><span class="label">Duration (Weeks):</span> ${weeksPassed}</p>
                <p><span class="label">Interest:</span> ${interest.toFixed(0)}</p>
                <p><span class="label">Total Amount to Repay:</span> ${totalRepayment.toFixed(0)}</p>
                <button id="confirmPaymentBtn">Confirm Payment</button>
                <button id="disposeBtn">Dispose</button>
            `;

            // Handle Confirm Payment Button
            document.getElementById('confirmPaymentBtn').addEventListener('click', async () => {
                if (member.paid_status === "Paid" || member.paid_status === "Disposed") {
                    alert(`This loan is already ${member.paid_status.toLowerCase()}. You cannot confirm payment.`);
                    return;
                }

                const confirmed = confirm('Are you sure you want to confirm this payment?');

                if (confirmed) {
                    await fetch('/confirm_payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            national_number: member.national_number,
                            loan_amount: loanAmount.toFixed(0),
                            interest: interest.toFixed(0),
                            total_amount: totalRepayment.toFixed(0),
                            repayment_date: repaymentDate
                        })
                    });

                    alert('Payment confirmed and recorded successfully.');
                    window.location.href = '/view-payments.html';
                }
            });

            // Handle Dispose Button
            document.getElementById('disposeBtn').addEventListener('click', async () => {
                if (member.paid_status === "Paid" || member.paid_status === "Disposed") {
                    alert(`This loan is already ${member.paid_status.toLowerCase()}. You cannot dispose of it.`);
                    return;
                }

                const confirmed = confirm('Are you sure you want to dispose of this loan?');

                if (confirmed) {
                    await fetch('/add_disposed_item', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: member.name,
                            national_number: member.national_number,
                            loan_amount: member.loan_amount,
                            loan_duration: weeksPassed,
                            interest: interest.toFixed(0),
                            total_amount_repayable: totalRepayment.toFixed(0),
                            status: 'Not Sold'
                        })
                    });

                    alert('Loan status updated to Disposed and details saved.');
                    window.location.href = '/view-disposed-items.html';
                }
            });
        } catch (error) {
            console.error("Error:", error);
            alert('Error calculating repayment. Please try again.');
        }
    });
});
