<script>
    // @ts-nocheck
    import { authHandlers } from "../store/store";
    import { onMount, tick} from 'svelte';
    import { doc, setDoc, getDocs, collection } from "firebase/firestore";
    import { onAuthStateChanged } from "firebase/auth";
    import { authenticate, db } from "$lib/firebase/firebase";
    import { fade } from 'svelte/transition';
  
    let user = null;
    let autoScrollInterval;
    let stepsContainer;
  
    onMount(() => {
      // Authenticate User
      onAuthStateChanged(authenticate, async (currentUser) => {
        user = currentUser || null;
        if (user) {
          await loadSavedRecipes();
        } else {
          savedRecipeIds = new Set();
        }
      });
  
      const generateButton = document.getElementById('generate-button');
      const recipeDisplay = document.getElementById('recipe-display');
  
      if (generateButton) {
        generateButton.addEventListener('click', fetchData);
      }
  
      // Auto scroll functionality
      stepsContainer = document.querySelector('.steps-container');
      
      function autoScroll() {
          if (!stepsContainer) return;
          
          const scrollAmount = 200;
          let currentScroll = 0;
          const maxScroll = stepsContainer.scrollWidth - stepsContainer.clientWidth;
  
          autoScrollInterval = setInterval(() => {
              currentScroll += scrollAmount;
              
              // Reset scroll position if we've reached the end
              if (currentScroll >= maxScroll + scrollAmount) {
                  currentScroll = 0;
                  stepsContainer.scrollTo({ left: 0, behavior: 'auto' });
              } else {
                  stepsContainer.scrollTo({ 
                      left: currentScroll, 
                      behavior: 'smooth' 
                  });
              }
          }, 2000); // Decreased to 2 seconds
      }
  
      // Start auto-scroll
      autoScroll();
  
      // Pause on hover
      stepsContainer.addEventListener('mouseenter', () => {
          clearInterval(autoScrollInterval);
      });
  
      // Resume on mouse leave
      stepsContainer.addEventListener('mouseleave', () => {
          autoScroll();
      });
  
      return () => {
          // Cleanup on component unmount
          if (autoScrollInterval) {
              clearInterval(autoScrollInterval);
          }
      };
    });
  
    // Navigation Functions
    function handleLearnMore() {
      const learnMoreLocation = document.getElementById('learn');
      if (learnMoreLocation) {
        learnMoreLocation.scrollIntoView({ behavior: 'smooth' });
      }
    }
  
    function handleLogin() {
      window.location.href = "/Auth";
    }
  
    function toggleOverlay() {
      const overlay = document.getElementById('overlay');
      overlay.classList.toggle('active');
    }
  
    function toggleMenu() {
      const menuContent = document.getElementById('dropdownContent');
      const overlay = document.getElementById('overlay');
  
      if (menuContent.classList.contains('active')) {
        menuContent.classList.remove('active');
        overlay.classList.remove('active');
      } else {
        menuContent.classList.add('active');
        overlay.classList.add('active');
      }
    }
  
    onMount(() => {
      const menu = document.getElementById('menu');
      const overlay = document.getElementById('overlay');
      const menuContent = document.getElementById('dropdownContent');
  
      if (menu) {
        menu.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleMenu();
        });
      }
  
      if (overlay) {
        overlay.addEventListener('click', () => {
          overlay.classList.remove('active');
          menuContent.classList.remove('active');
        });
      }
  
      if (menuContent) {
        // Prevent clicks inside menu-content from closing the menu
        menuContent.addEventListener('click', (event) => {
          event.stopPropagation();
        });
      }
    });
  
    // Define an array of FAQs
    let faqs = [
      {
        question: "How do I use Flavify?",
        answer: "To use Flavify, simply input your ingredients, dietary preferences, and the number of recipes you want. Then, click the 'Generate' button to see your recipes!"
      },
      {
        question: "Do I need to input exact measurements of ingredients?",
        answer: "No, you do not need to input exact measurements of ingredients. The AI will generate a recipe based on the ingredients you have."
      },
      {
        question: "How do I save my favorite recipes?",
        answer: "After selecting your recipes, you can save them to your profile by clicking the 'Save Recipe' button."
      },
      {
        question: "What if I have allergies?",
        answer: "Simply select the allergies you have in the dropdown menu and the recipes will be generated without those ingredients."
      },
      {
        question: "What dietary preferences can I specify?",
        answer: "You can specify any dietary preference such as vegetarian, vegan, keto, gluten-free, low-carb, or any other dietary restriction. The AI will adapt the recipes accordingly."
      },
      {
        question: "Are the recipes generated different each time?",
        answer: "Yes, the recipes are generated differently each time you click the generate button."
      }
    ];
  
    let openIndex = null;
  
    function toggleAnswer(index) {
      openIndex = openIndex === index ? null : index;
    }
  
    function redirectHome() {
      window.location.href = "/";
    }
  </script>  
  
  <body class="main-container">
    <div id="overlay" class="overlay"></div>
    <div class="nav-container">
        <div class="nav-bar-items">
            <!-- Left side - Title -->
            <div class="main-title">
                Flavify
            </div>
  
            <!-- Right side - Menu -->
            <div class="nav-right">
                <div class="menu-dropdown">
                    <button class="menu" on:click={toggleMenu}>
                        <div class="line"></div>
                        <div class="line"></div>
                        <div class="line"></div>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="menu-content" id="dropdownContent">
        <button on:click={handleLogin} class="logout-button">
            <a class="text-center" style="color: whitesmoke;" href="#profile">Already have an account?</a>
        </button>
        <button on:click={handleLogin} class="logout-button">
            <a href="#logout" style="color: whitesmoke;">Register here</a>
        </button>
    </div>
  
    <div class="hero-container-box">
      <div class="hero-contain">
          <!-- Left side: Text and buttons -->
          <div class="hero-text-content">
            <div class="hero-text">
              <h1>Personalize Your Recipes To Your Taste!</h1>
            </div>
              <p class="description">Create your own custom recipe based on what you have in your pantry, your dietery preferences, and more!</p>
              <div class="button-grid">
                  <button on:click={handleLearnMore} class="learn-more-button">
                      <span class="learn-more-text">Learn more</span>
                  </button>
              </div>
          </div>
  
          <!-- Right side: Header Image -->
          <div class="header-image-container">
              <div class="header-image"></div>
          </div>
      </div>
    </div>
    <div class="hero-about-container">
        <div class="about-contain">
            <h2 id='learn' class="why-this-title">
                Why
            </h2>
            <h2 class="why-this-title-2">
                choose Flavify?
            </h2>
            <div class="why-container">
                <!-- First Column -->
                <div class="grid-column">
                    <div class="grid-item-1"></div>
                    <div class="below-grid-text">
                        <h2 class="grid-title">Easy to use</h2>
                        <div class="description-container">
                          <p class="text-black mr-5 font-libre">
                              Simply input your available ingredients and preferences to create delicious meals without unnecessary grocery trips.
                          </p>
                        </div>                                                                        
                    </div>
                </div>
                <!-- Second Column -->
                <div class="grid-column">
                    <div class="grid-item-2"></div>
                    <div class="below-grid-text">
                        <h2 class="grid-title">Free to use</h2>
                        <div class="description-container">
                          <p class="text-black mr-5 font-libre">
                              Access all features without any hidden fees or subscriptions. Create your favorite recipes completely free.
                          </p>
                        </div>                       
                    </div>
                </div>
  
                <!-- Third Column -->
                <div class="grid-column">
                    <div class="grid-item-3"></div>
                    <div class="below-grid-text">
                        <h2 class="grid-title">User friendly</h2>                       
                        <div class="description-container">
                          <p class="text-black mr-5 font-libre">
                              Modern and intuitive interface designed for both beginners and experienced cooks.
                          </p>
                        </div>                                                                        
                    </div>
                </div>
            </div>
        </div>
    </div>
  
    <div>
        <div class="layout">
            <main>
                <div class="main-how-container">
                    <h1 class="section-title">How It Works</h1>
                    <div class="steps-wrapper">
                        <div class="steps-container">
                            <div class="step-card-1">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h3 class="text-[#2C3E50] font-bold text-xl mb-2">Input Ingredients</h3>
                                    <p class="text-[#34495E] font-medium">Enter any ingredients you have in your pantry. Our AI will work with what you have available.</p>
                                    <div class="step-image"></div>
                                </div>
                            </div>
                            <div class="step-card-2">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h3 class="text-[#2C3E50] font-bold text-xl mb-2">Dietary Preferences</h3>
                                    <p class="text-[#34495E] font-medium">Specify any dietary restrictions or preferences to personalize your recipe results.</p>
                                    <div class="step-image"></div>
                                </div>
                            </div>
                            <div class="step-card-3">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h3 class="text-[#2C3E50] font-bold text-xl mb-2">Allergy Information</h3>
                                    <p class="text-[#34495E] font-medium">Let us know about any allergies to ensure your recipes are safe and suitable.</p>
                                    <div class="step-image"></div>
                                </div>
                            </div>
                            <div class="step-card-4">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h3 class="text-[#2C3E50] font-bold text-xl mb-2">Choose Amount</h3>
                                    <p class="text-[#34495E] font-medium">Select how many recipe suggestions you'd like to receive.</p>
                                    <div class="step-image"></div>
                                </div>
                            </div>
                            <div class="step-card-5">
                                <div class="step-number">5</div>
                                <div class="step-content">
                                    <h3 class="text-[#2C3E50] font-bold text-xl mb-2">Generate Recipes</h3>
                                    <p class="text-[#34495E] font-medium">Click generate and discover your personalized recipes with detailed instructions.</p>
                                    <div class="step-image"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
        <div class="benefit-container"></div>
        <div class="layout">
            <!-- FAQ Section -->
            <div class="faq-section">
              <div class="about-contain-1">
                <div class="question-box">
                  <h2>FAQs</h2>
                  {#each faqs as { question, answer }, index}
                      <div class="faq-item">
                          <button class="faq-question" on:click={() => toggleAnswer(index)} type="button">
                              {question}
                          </button>
                          {#if openIndex === index}
                              <div class="faq-answer" transition:fade={{ duration: 300 }}>
                                  {answer}
                              </div>
                          {/if}
                      </div>
                  {/each}
                </div>
              </div>
            </div>
        </div>
    <div class="main-socials-container">
      <div class="socials-content">
          <div class="socials-header">
              <h2 class="socials-title">Connect With Me</h2>
              <p class="socials-description">Follow me on social media and feel free to connect!</p>
          </div>
          <div class="socials-grid">
              <a href="https://www.instagram.com/benn_niu04/" class="social-card">
                  <i class="fab fa-instagram"></i>
                  <span>Instagram</span>
              </a>
              <a href="https://github.com/benniu04" class="social-card">
                  <i class="fab fa-github"></i>
                  <span>GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/ben-niu-244820230/" class="social-card">
                  <i class="fab fa-linkedin"></i>
                  <span>LinkedIn</span>
              </a>
              <a href="https://www.tiktok.com/@bigbennn10" class="social-card">
                  <i class="fab fa-tiktok"></i>
                  <span>TikTok</span>
              </a>
          </div>
      </div>
    </div>
    
  </body>