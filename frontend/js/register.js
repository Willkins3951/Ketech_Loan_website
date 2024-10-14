document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.querySelector('input[name="username"]').value;
        const email = document.querySelector('input[name="email"]').value;
        const password = document.querySelector('input[name="password"]').value;
        const confirmPassword = document.querySelector('input[name="confirm_password"]').value;

        // Log the form data to the console
        console.log({
            username: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });

        // Basic validation
        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Prepare data to send to the backend
        const registrationData = {
            username: username,
            email: email,
            password: password,
            confirm_password: confirmPassword
        };

        try {
            // Send registration request to the backend
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            // Handle server response
            if (response.ok) {
                alert('Registration successful!');
                window.location.href = "/login.html"; // Redirect to login page
            } else {
                const error = await response.json();
                alert(`Registration failed: ${error.message}`);
            }
        } catch (err) {
            console.error('Error during registration:', err);
            alert('An error occurred during registration. Please try again later.');
        }
    });
});
