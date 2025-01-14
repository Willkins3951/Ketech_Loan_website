
  
// //   ==== ACTIVE NAV LINK

// document.addEventListener("DOMContentLoaded", function() {
//     const navLinks = document.querySelectorAll(".nav-link");
  
//     // Loop through each nav link and add event listener
//     navLinks.forEach(function(navLink) {
//       navLink.addEventListener("click", function(event) {
//         // Remove active class from all nav links
//         navLinks.forEach(function(link) {
//           link.classList.remove("active");
//         });
  
//         // Add active class to the clicked nav link
//         navLink.classList.add("active");
//       });
  
//       // Check if current URL matches the href of the nav link
//       if (navLink.href === window.location.href) {
//         navLink.classList.add("active");
//       }
//     });
//   });
  





//  SCROLL EFFECT ON NAVBAR 

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY; // Get scroll position
    const threshold = 50; // Threshold for applying background color (adjust as needed)

    if (scrollY >= threshold) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

    // Scroll up button functionality
    
    const scrollUpButton = document.getElementById('scroll-up');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            scrollUpButton.style.display = 'block';
        } else {
            scrollUpButton.style.display = 'none';
        }
    });
    
    scrollUpButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    //   //SHOW NAV LINKS 

    const menu = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('#open-menu');
    const closeBtn = document.querySelector('#close-menu');
    
    
    
    menuBtn.addEventListener('click', () =>{
        menu.style.display = "block";
        closeBtn.style.display = "inline-block";
        menuBtn.style.display = "none";
    
    })
    
    const closeNav = () =>{
        menu.style.display = "none";
        closeBtn.style.display = "none";
        menuBtn.style.display = "inline-block";
    }
    
    closeBtn.addEventListener('click', closeNav);
    


