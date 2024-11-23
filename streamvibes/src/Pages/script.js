const streams = [
    {
      title: 'Gaming Marathon',
      streamer: 'ProGamer123',
      viewers: 1500,
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'Gaming',
      url: 'https://github.com/rtk5/AFLL-sem3'
    },
    {
      title: 'Live Music Session',
      streamer: 'MusicMaster',
      viewers: 800,
      thumbnail: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'Music',
      url: 'https://github.com/rtk5/The-Web-Developer-Bootcamp'
    },
    {
      title: 'Tech Talk Show',
      streamer: 'TechGuru',
      viewers: 1200,
      thumbnail: 'https://images.unsplash.com/photo-1496065187959-7f07b8353c55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'Talk Shows',
      url: 'https://github.com/rtk5/Canvas-Clue'
    }
  ];
  
  // Populate streams grid
  function populateStreams(category = 'All') {
    const streamsGrid = document.querySelector('.streams-grid');
    streamsGrid.innerHTML = '';
  
    const filteredStreams = category === 'All' 
      ? streams 
      : streams.filter(stream => stream.category === category);
  
    filteredStreams.forEach(stream => {
      const streamCard = document.createElement('div');
      streamCard.className = 'stream-card';
      streamCard.style.cursor = 'pointer';
      streamCard.innerHTML = `
        <img src="${stream.thumbnail}" alt="${stream.title}">
        <div class="stream-info">
          <h3>${stream.title}</h3>
          <p>${stream.streamer}</p>
          <p>${stream.viewers} viewers</p>
        </div>
      `;
      
      streamCard.addEventListener('click', () => {
        window.location.href = stream.url;
      });
      
      streamsGrid.appendChild(streamCard);
    });
  }
  
  // Initialize streams
  document.addEventListener('DOMContentLoaded', () => {
    populateStreams();
  
    // Stream filters
    const filterButtons = document.querySelectorAll('.stream-filters button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        populateStreams(button.textContent);
      });
    });
  
    // Contact form
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Add form submission logic here
      alert('Message sent successfully!');
      contactForm.reset();
    });
  
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  });
  
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(45, 52, 54, 0.95)';
    } else {
      navbar.style.background = 'rgba(45, 52, 54, 0.8)';
    }
  });