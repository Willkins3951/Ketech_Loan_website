document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    // Fetch member details
    const memberResponse = await fetch(`/members/${memberId}`);
    const member = await memberResponse.json();

    // Display member details
    const memberDetailsDiv = document.getElementById('memberDetails');
    memberDetailsDiv.innerHTML = `
        <p>Name: ${member.name}</p>
        <p>National Number: ${member.national_number}</p>
        <p>Loan Amount: ${member.loan_amount}</p>
        <p>Loan Issue Date: ${member.loan_issue_date}</p>
        <p>Guarantee Item: ${member.guarantee_item}</p>
    `;

    // Handle the calculate button click
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', async () => {
        const repaymentDate = document.getElementById('repaymentDate').value;

        if (!repaymentDate) {
            alert('Please select a repayment date.');
            return;
        }

        try {
            const response = await fetch('/calculate_repayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    member_id: memberId,
                    repayment_date: repaymentDate
                })
            });

            if (!response.ok) {
                throw new Error('Error calculating repayment');
            }

            const result = await response.json();
            console.log(result); // Log the result to see the returned values

            // Ensure result contains interest and totalRepayment
            const calculationResultsDiv = document.getElementById('calculationResults');
            calculationResultsDiv.innerHTML = `
                <p>Interest: ${result.interest.toFixed(2)}</p>
                <p>Total Amount to Repay: ${result.totalRepayment.toFixed(2)}</p>
                <button id="confirmPaymentBtn">Confirm Payment</button>
            `;

            // Confirm payment button event listener
            document.getElementById('confirmPaymentBtn').addEventListener('click', async () => {
                const confirmed = confirm('Are you sure you want to confirm this payment?');

                if (confirmed) {
                    await fetch('/confirm_payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            member_id: memberId,
                            interest: result.interest,
                            total_amount: result.totalRepayment,
                            repayment_date: repaymentDate
                        })
                    });

                    alert('Payment confirmed and recorded successfully.');
                    window.location.href = '/home.html'; // Redirect to home or another page
                }
            });
        } catch (error) {
            console.error(error);
            alert('Error calculating repayment. Please try again.');
        }
    });
});
