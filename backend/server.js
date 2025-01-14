

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Enable parsing of JSON request bodies

// Serve static files from the 'frontend' folder (for HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Route for handling registration form submission
app.post('/register', (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  // Check if all fields are filled
  if (!username || !email || !password || !confirm_password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check if password and confirm_password match
  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  // Hash the password and insert into the database
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password.' });
    }

    // Insert user into the database
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error inserting user into the database.' });
      }
      res.status(200).json({ message: 'Sign up successful! You can now log in.' });
    });
  });
});

// Route for handling login form submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error finding user.' });
    }

    if (result.length > 0) {
      // Compare the stored hashed password with the entered password
      bcrypt.compare(password, result[0].password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ message: 'Error comparing passwords.' });
        }

        if (isMatch) {
          res.status(200).json({ message: `Welcome, ${username}!` });
        } else {
          res.status(400).json({ message: 'Invalid username or password.' });
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid username or password.' });
    }
  });
});

// Route to add a new member
app.post('/add_member', (req, res) => {
  const { name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status } = req.body;

  // Ensure all required fields are provided
  if (!name || !national_number || !phone_number || !loan_amount || !loan_duration || !guarantee_item || !loan_issue_date) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Insert member into the database
  const query = 'INSERT INTO members (name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error adding member to the database.' });
    }
    res.status(200).json({ message: 'Member added successfully!' });
  });
});

// Route to view all members
app.get('/members', (req, res) => {
  const query = 'SELECT * FROM members';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching members.' });
    }
    res.status(200).json(result);
  });
});

app.get('/api/members', (req, res) => {
  const query = 'SELECT * FROM members';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching members' });
    }
    res.status(200).json(results);
  });
});

// Delete a member
app.delete('/api/delete_member/:id', (req, res) => {
  const memberId = req.params.id;
  const deleteQuery = 'DELETE FROM members WHERE id = ?';

  db.query(deleteQuery, [memberId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting member' });
    }
    res.status(200).json({ success: true, message: 'Member deleted successfully!' });
  });
});


// Delete a payment
app.delete('/api/delete_payment/:id', (req, res) => {
  const paymentId = req.params.id;
  const deleteQuery = 'DELETE FROM payments WHERE id = ?';

  db.query(deleteQuery, [paymentId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting payment' });
    }

    // Check if any row was affected
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ success: true, message: 'Payment deleted successfully!' });
  });
});


// Delete a disposed item
app.delete('/api/delete_disposed_item/:id', (req, res) => {
  const itemId = req.params.id;
  const deleteQuery = 'DELETE FROM disposed_items WHERE id = ?';

  db.query(deleteQuery, [itemId], (err, result) => {
      if (err) {
          console.error('Error deleting disposed item:', err);
          return res.status(500).json({ message: 'Error deleting item' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Item not found' });
      }

      res.status(200).json({ success: true, message: 'Item deleted successfully' });
  });
});


// Route to get member details by ID
app.get('/members/:id', (req, res) => {
  const memberId = req.params.id;

  const query = 'SELECT * FROM members WHERE id = ?';
  db.query(query, [memberId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching member details.' });
    res.status(200).json(result[0]);
  });
});



// Confirm payment route and update paid status
app.post('/confirm_payment', (req, res) => {
    const { national_number, loan_amount, interest, total_amount, repayment_date } = req.body; // Make sure loan_amount is included

    // Insert payment record into the database (assuming a payments table exists)
    const paymentQuery = 'INSERT INTO payments (national_number, loan_amount, interest, total_amount, repayment_date) VALUES (?, ?, ?, ?, ?)';

    db.query(paymentQuery, [national_number, loan_amount, interest, total_amount, repayment_date], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error recording payment.' });
        }

        // Update the paid status in the members table
        const updatePaidStatusQuery = 'UPDATE members SET paid_status = "Paid" WHERE national_number = ?';

        db.query(updatePaidStatusQuery, [national_number], (err, updateResult) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating member paid status.' });
            }
            res.status(200).json({ message: 'Payment recorded and paid status updated successfully!' });
        });
    });
});




// Confirm dispose route and update paid status

app.post('/add_disposed_item', (req, res) => {
  const { name, national_number, loan_amount, loan_duration, interest, total_amount_repayable, status } = req.body;

  // Insert the disposed item
  const insertQuery = `
      INSERT INTO disposed_items (name, national_number, loan_amount, loan_duration, interest, total_amount_repayable, status, disposed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(insertQuery, [name, national_number, loan_amount, loan_duration, interest, total_amount_repayable, status], (err, result) => {
      if (err) {
          console.error('Error inserting disposed item:', err);
          return res.status(500).json({ message: 'Error saving disposed item.' });
      }

      // Update the member's status to Disposed
      const updateQuery = `
          UPDATE members 
          SET paid_status = 'Disposed' 
          WHERE national_number = ? AND paid_status != 'Paid'
      `;

      db.query(updateQuery, [national_number], (err, updateResult) => {
          if (err) {
              console.error('Error updating member status:', err);
              return res.status(500).json({ message: 'Error updating member status.' });
          }

          console.log('Member status updated to Disposed:', updateResult);
          res.status(200).json({ message: 'Disposed item saved and member status updated successfully!' });
      });
  });
});




// Route to view all payments
app.get('/payments', (req, res) => {
  const query = 'SELECT * FROM payments';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching payments.' });
    }
    res.status(200).json(result);
  });
});

// API Route to fetch payment data
app.get('/api/payments', (req, res) => {
  const query = 'SELECT * FROM payments';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching payments' });
    }
    res.status(200).json(results);
  });
});


// // Route to view all disposed items

app.get('/api/disposed-items', (req, res) => {
  const query = 'SELECT * FROM disposed_items';
  
  db.query(query, (err, result) => {
      if (err) {
          console.error('Error fetching disposed items:', err);
          return res.status(500).json({ message: 'Error fetching disposed items.' });
      }

      console.log(result); // Log the result to see if 'total_amount_to_repay' exists and has a value
      res.status(200).json(result);
  });
});







// // Route to view all buyers

app.get('/api/buyers', (req, res) => {
  const query = 'SELECT * FROM buyers';
  
  db.query(query, (err, result) => {
      if (err) {
          console.error('Error fetching buyers:', err);
          return res.status(500).json({ message: 'Error fetching buyers details.' });
      }

      console.log(result); // Log the result to see if 'total_amount_to_repay' exists and has a value
      res.status(200).json(result);
  });
});


app.get('/api/disposed-items/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM disposed_items WHERE id = ?';

  db.query(query, [id], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error fetching disposed item.' });
      }

      if (result.length === 0) {
          return res.status(404).json({ message: 'Disposed item not found.' });
      }

      res.status(200).json(result[0]);
  });
});












// Catch-all route for undefined routes
app.get('*', (req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});











// require('dotenv').config();
// const express = require('express');
// const mysql = require('mysql2');
// const bcrypt = require('bcrypt');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// app.use(cors()); // Enable CORS for all requests
// app.use(express.json()); // Enable parsing of JSON request bodies

// // Serve static files from the 'frontend' folder (for HTML, CSS, JS files)
// app.use(express.static(path.join(__dirname, '../frontend')));

// // Database connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // Connect to the database
// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed: ' + err.stack);
//     return;
//   }
//   console.log('Connected to database.');
// });

// // Route for handling registration form submission
// app.post('/register', (req, res) => {
//   const { username, email, password, confirm_password } = req.body;

//   // Check if all fields are filled
//   if (!username || !email || !password || !confirm_password) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   // Check if password and confirm_password match
//   if (password !== confirm_password) {
//     return res.status(400).json({ message: 'Passwords do not match.' });
//   }

//   // Hash the password and insert into the database
//   bcrypt.hash(password, 10, (err, hashedPassword) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error hashing password.' });
//     }

//     // Insert user into the database
//     const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
//     db.query(query, [username, email, hashedPassword], (err, result) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error inserting user into the database.' });
//       }
//       res.status(200).json({ message: 'Sign up successful! You can now log in.' });
//     });
//   });
// });

// // Route for handling login form submission
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;

//   // Find the user in the database
//   const query = 'SELECT * FROM users WHERE username = ?';
//   db.query(query, [username], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error finding user.' });
//     }

//     if (result.length > 0) {
//       // Compare the stored hashed password with the entered password
//       bcrypt.compare(password, result[0].password, (err, isMatch) => {
//         if (err) {
//           return res.status(500).json({ message: 'Error comparing passwords.' });
//         }

//         if (isMatch) {
//           res.status(200).json({ message: `Welcome, ${username}!` });
//         } else {
//           res.status(400).json({ message: 'Invalid username or password.' });
//         }
//       });
//     } else {
//       res.status(400).json({ message: 'Invalid username or password.' });
//     }
//   });
// });

// // Route to add a new member
// app.post('/add_member', (req, res) => {
//   const { name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status } = req.body;

//   // Ensure all required fields are provided
//   if (!name || !national_number || !phone_number || !loan_amount || !loan_duration || !guarantee_item || !loan_issue_date) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   // Insert member into the database
//   const query = 'INSERT INTO members (name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

//   db.query(query, [name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error adding member to the database.' });
//     }
//     res.status(200).json({ message: 'Member added successfully!' });
//   });
// });


// // Delete a member
// app.delete('/api/delete_member/:id', (req, res) => {
//   const memberId = req.params.id;
//   const deleteQuery = 'DELETE FROM members WHERE id = ?';

//   db.query(deleteQuery, [memberId], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error deleting member' });
//     }
//     res.status(200).json({ success: true, message: 'Member deleted successfully!' });
//   });
// });

// // Route to get member details by ID
// app.get('/members/:id', (req, res) => {
//   const memberId = req.params.id;

//   const query = 'SELECT * FROM members WHERE id = ?';
//   db.query(query, [memberId], (err, result) => {
//     if (err) return res.status(500).json({ message: 'Error fetching member details.' });
//     res.status(200).json(result[0]);
//   });
// });


// // Route to view all members
// app.get('/members', (req, res) => {
//   const query = 'SELECT * FROM members';
//   db.query(query, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error fetching members.' });
//     }
//     res.status(200).json(result);
//   });
// });


// // Confirm payment route and update paid status
// app.post('/confirm_payment', (req, res) => {
//     const { national_number, loan_amount, interest, total_amount, repayment_date } = req.body; // Make sure loan_amount is included

//     // Insert payment record into the database (assuming a payments table exists)
//     const paymentQuery = 'INSERT INTO payments (national_number, loan_amount, interest, total_amount, repayment_date) VALUES (?, ?, ?, ?, ?)';

//     db.query(paymentQuery, [national_number, loan_amount, interest, total_amount, repayment_date], (err, result) => {
//         if (err) {
//             return res.status(500).json({ message: 'Error recording payment.' });
//         }

//         // Update the paid status in the members table
//         const updatePaidStatusQuery = 'UPDATE members SET paid_status = "Paid" WHERE national_number = ?';

//         db.query(updatePaidStatusQuery, [national_number], (err, updateResult) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Error updating member paid status.' });
//             }
//             res.status(200).json({ message: 'Payment recorded and paid status updated successfully!' });
//         });
//     });
// });

// // Route to view all payments
// app.get('/payments', (req, res) => {
//   const query = 'SELECT * FROM payments';
//   db.query(query, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error fetching payments.' });
//     }
//     res.status(200).json(result);
//   });
// });


// // // Route to view all disposed items
// // app.get('/api/disposed-items', (req, res) => {
// //   const query = 'SELECT * FROM disposed_items'; // Adjust table name
// //   db.query(query, (err, result) => {
// //     if (err) {
// //       return res.status(500).json({ message: 'Error fetching disposed items.' });
// //     }
// //     res.status(200).json(result); // Return disposed items as JSON
// //   });
// // });



// // Update payment status to 'Disposed' and add to the disposed items
// app.post('/dispose_loan', (req, res) => {
//   const { national_number, loan_amount, loan_duration, guarantee_item } = req.body;

//   if (!national_number || !loan_amount || !loan_duration || !guarantee_item) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   const updateLoanStatusQuery = 'UPDATE members SET paid_status = "Disposed" WHERE national_number = ?';
//   db.query(updateLoanStatusQuery, [national_number], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error updating loan status.' });
//     }

//     const insertDisposedItemQuery = 'INSERT INTO disposed_items (national_number, loan_amount, loan_duration, guarantee_item) VALUES (?, ?, ?, ?)';
//     db.query(insertDisposedItemQuery, [national_number, loan_amount, loan_duration, guarantee_item], (err, result) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error adding disposed item.' });
//       }
//       res.status(200).json({ message: 'Loan disposed and status updated successfully!' });
//     });
//   });
// });






// app.delete('/api/delete_disposed_item/:id', (req, res) => {
//   const { id } = req.params;
//   const query = 'DELETE FROM disposed_items WHERE id = ?';

//   db.query(query, [id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error deleting disposed item.' });
//     }
//     res.status(200).json({ success: true, message: 'Disposed item deleted successfully!' });
//   });
// });







// // Route to update disposed item status to 'Sold' and save payment details
// app.post('/pay_for_disposed_item', (req, res) => {
//   const { national_number, amount_sold, date_sold, buyer_name, buyer_phone } = req.body;

//   if (!national_number || !amount_sold || !date_sold || !buyer_name || !buyer_phone) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   // Update disposed item status to 'Sold'
//   const updateStatusQuery = 'UPDATE disposed_items SET status = "Sold" WHERE national_number = ?';
//   db.query(updateStatusQuery, [national_number], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error updating disposed item status.' });
//     }

//     // Insert buyer information
//     const insertBuyerQuery = 'INSERT INTO buyers (national_number, buyer_name, buyer_phone, amount_sold, date_sold) VALUES (?, ?, ?, ?, ?)';
//     db.query(insertBuyerQuery, [national_number, buyer_name, buyer_phone, amount_sold, date_sold], (err, result) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error saving buyer details.' });
//       }
//       res.status(200).json({ message: 'Payment recorded and disposed item sold successfully!' });
//     });
//   });
// });

// // Route to view all buyers
// app.get('/buyers', (req, res) => {
//   const query = 'SELECT * FROM buyers';
//   db.query(query, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error fetching buyers.' });
//     }
//     res.status(200).json(result);
//   });
// });


// // Confirm payment route and update paid status
// app.post('/confirm_payment', (req, res) => {
//   const { national_number, loan_amount, interest, total_amount, repayment_date } = req.body;

//   // Check if the loan status is 'Paid'
//   const checkPaidStatusQuery = 'SELECT paid_status FROM members WHERE national_number = ?';
//   db.query(checkPaidStatusQuery, [national_number], (err, result) => {
//       if (err) {
//           return res.status(500).json({ message: 'Error fetching loan status.' });
//       }

//       if (result.length > 0 && result[0].paid_status === 'Paid') {
//           return res.status(400).json({ message: 'This loan is already paid.' });
//       }

//       // Insert payment record into the database (assuming a payments table exists)
//       const paymentQuery = 'INSERT INTO payments (national_number, loan_amount, interest, total_amount, repayment_date) VALUES (?, ?, ?, ?, ?)';
//       db.query(paymentQuery, [national_number, loan_amount, interest, total_amount, repayment_date], (err, result) => {
//           if (err) {
//               return res.status(500).json({ message: 'Error recording payment.' });
//           }

//           // Update the paid status in the members table
//           const updatePaidStatusQuery = 'UPDATE members SET paid_status = "Paid" WHERE national_number = ?';
//           db.query(updatePaidStatusQuery, [national_number], (err, updateResult) => {
//               if (err) {
//                   return res.status(500).json({ message: 'Error updating member paid status.' });
//               }
//               res.status(200).json({ message: 'Payment recorded and paid status updated successfully!' });
//           });
//       });
//   });
// });





// // Catch-all route for undefined routes
// app.get('*', (req, res) => {
//   res.status(404).send('Page not found');
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

































// require('dotenv').config();
// const express = require('express');
// const mysql = require('mysql2');
// const bcrypt = require('bcrypt');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// app.use(cors()); // Enable CORS for all requests
// app.use(express.json()); // Enable parsing of JSON request bodies

// // Serve static files from the 'frontend' folder (for HTML, CSS, JS files)
// app.use(express.static(path.join(__dirname, '../frontend')));

// // Database connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // Connect to the database
// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed: ' + err.stack);
//     return;
//   }
//   console.log('Connected to database.');
// });

// // Route for handling registration form submission
// app.post('/register', (req, res) => {
//   const { username, email, password, confirm_password } = req.body;

//   // Check if all fields are filled
//   if (!username || !email || !password || !confirm_password) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   // Check if password and confirm_password match
//   if (password !== confirm_password) {
//     return res.status(400).json({ message: 'Passwords do not match.' });
//   }

//   // Hash the password and insert into the database
//   bcrypt.hash(password, 10, (err, hashedPassword) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error hashing password.' });
//     }

//     // Insert user into the database
//     const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
//     db.query(query, [username, email, hashedPassword], (err, result) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error inserting user into the database.' });
//       }
//       res.status(200).json({ message: 'Sign up successful! You can now log in.' });
//     });
//   });
// });

// // Route for handling login form submission
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;

//   // Find the user in the database
//   const query = 'SELECT * FROM users WHERE username = ?';
//   db.query(query, [username], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error finding user.' });
//     }

//     if (result.length > 0) {
//       // Compare the stored hashed password with the entered password
//       bcrypt.compare(password, result[0].password, (err, isMatch) => {
//         if (err) {
//           return res.status(500).json({ message: 'Error comparing passwords.' });
//         }

//         if (isMatch) {
//           res.status(200).json({ message: `Welcome, ${username}!` });
//         } else {
//           res.status(400).json({ message: 'Invalid username or password.' });
//         }
//       });
//     } else {
//       res.status(400).json({ message: 'Invalid username or password.' });
//     }
//   });
// });

// // Route to add a new member
// app.post('/add_member', (req, res) => {
//   const { name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status } = req.body;

//   // Ensure all required fields are provided
//   if (!name || !national_number || !phone_number || !loan_amount || !loan_duration || !guarantee_item || !loan_issue_date) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   // Insert member into the database
//   const query = 'INSERT INTO members (name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

//   db.query(query, [name, national_number, phone_number, loan_amount, loan_duration, guarantee_item, loan_issue_date, paid_status], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error adding member to the database.' });
//     }
//     res.status(200).json({ message: 'Member added successfully!' });
//   });
// });

// // Route to view all members
// app.get('/members', (req, res) => {
//   const query = 'SELECT * FROM members';
//   db.query(query, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error fetching members.' });
//     }
//     res.status(200).json(result);
//   });
// });

// app.get('/api/members', (req, res) => {
//   const query = 'SELECT * FROM members';
//   db.query(query, (err, results) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error fetching members' });
//     }
//     res.status(200).json(results);
//   });
// });

// // Delete a member
// app.delete('/api/delete_member/:id', (req, res) => {
//   const memberId = req.params.id;
//   const deleteQuery = 'DELETE FROM members WHERE id = ?';

//   db.query(deleteQuery, [memberId], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error deleting member' });
//     }
//     res.status(200).json({ success: true, message: 'Member deleted successfully!' });
//   });
// });

// // Route to get member details by ID
// app.get('/members/:id', (req, res) => {
//   const memberId = req.params.id;

//   const query = 'SELECT * FROM members WHERE id = ?';
//   db.query(query, [memberId], (err, result) => {
//     if (err) return res.status(500).json({ message: 'Error fetching member details.' });
//     res.status(200).json(result[0]);
//   });
// });



// // Confirm payment route and update paid status
// app.post('/confirm_payment', (req, res) => {
//     const { national_number, loan_amount, interest, total_amount, repayment_date } = req.body; // Make sure loan_amount is included

//     // Insert payment record into the database (assuming a payments table exists)
//     const paymentQuery = 'INSERT INTO payments (national_number, loan_amount, interest, total_amount, repayment_date) VALUES (?, ?, ?, ?, ?)';

//     db.query(paymentQuery, [national_number, loan_amount, interest, total_amount, repayment_date], (err, result) => {
//         if (err) {
//             return res.status(500).json({ message: 'Error recording payment.' });
//         }

//         // Update the paid status in the members table
//         const updatePaidStatusQuery = 'UPDATE members SET paid_status = "Paid" WHERE national_number = ?';

//         db.query(updatePaidStatusQuery, [national_number], (err, updateResult) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Error updating member paid status.' });
//             }
//             res.status(200).json({ message: 'Payment recorded and paid status updated successfully!' });
//         });
//     });
// });



// // Route to view all payments
// app.get('/payments', (req, res) => {
//   const query = 'SELECT * FROM payments';
//   db.query(query, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error fetching payments.' });
//     }
//     res.status(200).json(result);
//   });
// });

// // API Route to fetch payment data
// app.get('/api/payments', (req, res) => {
//   const query = 'SELECT * FROM payments';
//   db.query(query, (err, results) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error fetching payments' });
//     }
//     res.status(200).json(results);
//   });
// });





// // Catch-all route for undefined routes
// app.get('*', (req, res) => {
//     res.status(404).send('Page not found');
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });










