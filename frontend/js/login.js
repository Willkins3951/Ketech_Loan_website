document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.querySelector('input[name="username"]').value;
        const password = document.querySelector('input[name="password"]').value;

        // Log the form data to the console
        console.log({
            username: username,
            password: password
        });

        // Basic validation
        if (!username || !password) {
            alert('Please fill in all fields.');
            return;
        }

        // Prepare data to send to the backend
        const loginData = {
            username: username,
            password: password
        };

        try {
            // Send login request to the backend
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            // Handle server response
            if (response.ok) {
                alert(`Welcome, ${username}!`);
                window.location.href = "/home.html"; // Redirect to home page after login
            } else {
                const error = await response.json();
                alert(`Login failed: ${error.message}`);
            }
            
        } catch (err) {
            console.error('Error during login:', err);
            alert('An error occurred during login. Please try again later.');
        }
    });
});
