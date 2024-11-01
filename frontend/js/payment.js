

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
    const formattedLoanIssueDate = loanIssueDate.toLocaleDateString('en-CA'); // Formats as YYYY-MM-DD

    memberDetailsDiv.innerHTML = `
        <p>Name: ${member.name}</p>
        <p>National Number: ${member.national_number}</p>
        <p>Loan Amount: ${member.loan_amount}</p>
        <p>Loan Issue Date: ${formattedLoanIssueDate}</p>
        <p>Guarantee Item: ${member.guarantee_item}</p>
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
            const weeksPassed = Math.ceil(timeDifference / (1000 * 60 * 60 * 24 * 7));

            // Calculate interest at 12% per week
            const interest = loanAmount * 0.12 * weeksPassed; // Calculate interest
            
            const totalRepayment = loanAmount + interest; // Calculate total repayment

            // Ensure both values are valid numbers
            if (isNaN(totalRepayment) || isNaN(interest)) {
                throw new Error('Invalid repayment data received.');
            }

            const calculationResultsDiv = document.getElementById('calculationResults');
            calculationResultsDiv.innerHTML = `
                <p>Duration (Weeks): ${weeksPassed}</p>
                <p>Interest: ${interest.toFixed(0)}</p>
                <p>Total Amount to Repay: ${totalRepayment.toFixed(0)}</p>
                <button id="confirmPaymentBtn">Confirm Payment</button>
            `;

            document.getElementById('confirmPaymentBtn').addEventListener('click', async () => {
                const confirmed = confirm('Are you sure you want to confirm this payment?');

                if (confirmed) {
                    await fetch('/confirm_payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            national_number: member.national_number, // Use national_number
                            loan_amount: loanAmount.toFixed(0), // Pass loan amount as fixed whole number
                            interest: interest.toFixed(0), // Pass interest as fixed whole number
                            total_amount: totalRepayment.toFixed(0), // Pass total repayment as fixed whole number
                            repayment_date: repaymentDate
                        })
                    });

                    alert('Payment confirmed and recorded successfully.');
                    window.location.href = '/home.html';
                }
            });
        } catch (error) {
            console.error("Error:", error);
            alert('Error calculating repayment. Please try again.');
        }
    });
});
