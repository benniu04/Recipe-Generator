<script>
    // @ts-nocheck
    import { authHandlers } from "../store/store";
    import { onMount, tick } from 'svelte';
    import { doc, setDoc, getDocs, collection } from "firebase/firestore";
    import { onAuthStateChanged } from "firebase/auth";
    import { authenticate, db } from "$lib/firebase/firebase";
    import { fade } from 'svelte/transition';
  
    let user = null;
    let isLoading = false;
    let inputIngredients = '';
    let dietaryPreference = '';
    let numOfRecipes = 0;
    let recipes = [];
    let formattedRecipes = [];
    let errorMessage = '';
    let successMessage = '';
    let savedRecipeIds = new Set();
  
    let autoScrollInterval;
    let stepsContainer;
  
    const API_URL = import.meta.env.PROD 
      ? 'https://recipe-generator-jkkdox8v1-benniu04s-projects.vercel.app'  // New Vercel URL
      : 'http://localhost:4000';
  
    async function loadSavedRecipes() {
      if (!user) return;
      
      try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "recipes"));
        savedRecipeIds = new Set();
        querySnapshot.docs.forEach(doc => {
          // Use the recipe title as the identifier since that's what we're saving in Profile
          savedRecipeIds.add(doc.data().title);
        });
        console.log('Loaded saved recipes:', savedRecipeIds);
      } catch (error) {
        console.error('Error loading saved recipes:', error);
      }
    }
  
    async function handleSaveRecipe(recipeIndex, buttonElement) {
      if (!user) {
        alert("Please log in to save recipes.");
        return;
      }
  
      try {
        const recipeCard = document.querySelector(`[data-recipe-index="${recipeIndex}"]`);
        if (!recipeCard) {
            throw new Error('Recipe card not found');
        }
  
        const titleElement = recipeCard.querySelector('strong');
        const recipeTitle = titleElement.textContent.replace(/^Recipe #\d+:\s*/, '').trim();
  
        // Check if recipe is already saved by title
        if (savedRecipeIds.has(recipeTitle)) {
          return;
        }
  
        const recipeData = {
            title: recipeTitle,
            recipeText: recipeCard.querySelector('.recipe-details').innerHTML,
            timestamp: new Date().toISOString(),
            userId: user.uid
        };
  
        console.log('Saving recipe data:', recipeData);
  
        // Generate a unique ID for the recipe
        const uniqueId = Date.now().toString();
        const recipeRef = doc(db, "users", user.uid, "recipes", uniqueId);
        await setDoc(recipeRef, recipeData);
  
        savedRecipeIds.add(recipeTitle);
        
        // Update the button state
        buttonElement.innerHTML = '<i class="fas fa-bookmark"></i> Saved!';
        buttonElement.classList.add('saved');
        buttonElement.disabled = true;
  
      } catch (error) {
          console.error('Error saving the recipe:', error);
          alert('Failed to save recipe');
      }
    }
  
    async function fetchOpenAIRecipe() {
      const allergies = document.getElementById('allergy-select').value;
      const allergyText = allergies && allergies !== 'none' ? ` and avoiding ${allergies} due to allergies` : '';
      
      const prompt = `Give me ${numOfRecipes} recipes based on the ingredients ${inputIngredients} and a dietary preference of ${dietaryPreference}${allergyText}. 
      Format each recipe like this, and do not add any concluding sentences. For the ingredients and instructions, provide however many ingredients and steps you see fit
      Also, change up the recipe name and ingredients to make it more interesting if the number of recipes is less than 4:
  
      RECIPE_START
      Recipe #[number]: [Recipe Name]
  
      <strong>Ingredients:</strong>
      • [ingredient 1]
      • [ingredient 2]
      • [ingredient 3]
  
      <strong>Instructions:</strong>
      1. [step 1]
      2. [step 2]
      3. [step 3]
      RECIPE_END`;
  
      try {
          const response = await fetch(`${API_URL}/api/generate-recipe`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({ prompt })
          });
  
          if (!response.ok) {
              const errorData = await response.json();
              console.error('Server error:', errorData);
              throw new Error(errorData.error || 'Network response was not ok');
          }
  
          const data = await response.json();
          recipes = data.recipe.split('RECIPE_START').filter(r => r.trim()).map(recipe => {
              recipe = recipe.split('RECIPE_END')[0];
              recipe = recipe.replace(/\b(Enjoy|Hope you enjoy).*$/i, '');
              return recipe.trim();
          });
  
          // Format the recipes into recipe cards
          formattedRecipes = recipes.map((recipe, index) => {
              const [title, ...details] = recipe.split('\n').filter(line => line.trim());
              return {
                  title,
                  details: details.join('<br>').replace(/\n/g, '<br>'),
                  index,
                  buttonRef: null
              };
          });
  
      } catch (error) {
          console.error('Error in fetchOpenAIRecipe:', error);
          throw error;
      }
    }
  
    async function fetchData() {
      // Get user inputs
      inputIngredients = document.getElementById('ingredient-input').value.trim();
      dietaryPreference = document.getElementById('diet-pref').value.trim();
      numOfRecipes = parseInt(document.getElementById('number-recipes').value.trim(), 10);
  
      if (isNaN(numOfRecipes) || numOfRecipes <= 0) {
          numOfRecipes = 4;
      }
  
      if (numOfRecipes > 10) {
          successMessage = 'Number of recipes cannot exceed 10';
          await tick();
          return;
      }
  
      isLoading = true;
  
      try {
          await fetchOpenAIRecipe();
      } finally {
          isLoading = false;
      }
    }
  
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
  
    function handlegetRecipe() {
      const recipeLocation = document.getElementById('recipe');
      if (recipeLocation) {
        recipeLocation.scrollIntoView({ behavior: 'smooth' });
      }
    }
  
    function handleProfile() {
      window.location.href = "/Profile";
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
        <button on:click={handleProfile} class="logout-button">
            <a class="text-center" style="color: whitesmoke;" href="#profile">Profile</a>
        </button>
        <button on:click={authHandlers.logout} class="logout-button">
            <a href="#logout" style="color: whitesmoke;">Logout</a>
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
                  <button on:click={handlegetRecipe} class="recipe-button">
                      <span class="recipe-text">Get recipe now</span>
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
            <h2 class="why-this-title">
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
                    <h1 id='learn' class="section-title">How It Works</h1>
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
            <div class="gen-container">                                
                <div class="about-contain-1">
                    <div class="gen-box">
                        <div id="recipe" class="actual-input-box">
                            <h2 class="input-text">Create Your Recipe</h2>
                            
                            <div class="input-ing">
                                <label for="ingredient-input">Ingredients Available</label>
                                <input 
                                    type="text" 
                                    id="ingredient-input" 
                                    placeholder="Enter ingredients..." 
                                />
                                <div class="input-tooltip">List ingredients separated by commas</div>
                            </div>
  
                            <div class="input-ing dietary">
                                <label for="diet-pref">Dietary Preference</label>
                                <input 
                                    type="text" 
                                    id="diet-pref" 
                                    placeholder="Enter your dietary preference..." 
                                />
                                <div class="input-tooltip">
                                    E.g., vegetarian, vegan, keto, etc.
                                </div>
                            </div>
  
                            <div class="input-ing allergy">
                                <label for="allergy-select">Allergies</label>
                                <select id="allergy-select" class="allergy-dropdown">
                                    <option value="">Select Allergies (if any)</option>
                                    <option value="dairy">Dairy</option>
                                    <option value="nuts">Nuts</option>
                                    <option value="shellfish">Shellfish</option>
                                    <option value="eggs">Eggs</option>
                                    <option value="soy">Soy</option>
                                    <option value="wheat">Wheat</option>
                                    <option value="fish">Fish</option>
                                    <option value="none">No Allergies</option>
                                </select>
                            </div>
  
                            <div class="input-ing number">
                                <label for="number-recipes">Number of Recipes</label>
                                <input 
                                    type="text" 
                                    id="number-recipes" 
                                    placeholder="Enter the number of recipes..." 
                                />
                                <div class="input-tooltip">
                                    Choose between 1-10 recipes
                                </div>
                            </div>
  
                            <button 
                                id="generate-button" 
                                class="gen-button" 
                                on:click={fetchData} 
                                disabled={isLoading}
                            >
                                {#if isLoading}
                                    <i class="fas fa-spinner fa-spin"></i> Generating...
                                {:else}
                                    Generate Recipe
                                {/if}
                            </button>
  
                            {#if successMessage}
                                <div class="success-message" transition:fade>{successMessage}</div>
                            {/if}
                        </div>
                        {#if formattedRecipes.length > 0}
                            <div class="output-box" id="recipe-display" transition:fade>
                                <p class="input-text">Your Recipes</p>
                                <div class="result-recipes">
                                    {#each formattedRecipes as recipe (recipe.index)}
                                        <div class="recipe-card" data-recipe-index={recipe.index}>
                                            <strong class="font-libre">{recipe.title}</strong>
                                            <div class="recipe-details">
                                                {@html recipe.details}
                                            </div>
                                            <div class="button-container">
                                                <button 
                                                    bind:this={recipe.buttonRef}
                                                    class="save-button {savedRecipeIds.has(recipe.title.replace(/^Recipe #\d+:\s*/, '').trim()) ? 'saved' : ''}" 
                                                    on:click={() => handleSaveRecipe(recipe.index, recipe.buttonRef)}
                                                    disabled={savedRecipeIds.has(recipe.title.replace(/^Recipe #\d+:\s*/, '').trim())}
                                                >
                                                    <i class="fas fa-bookmark"></i> 
                                                    {savedRecipeIds.has(recipe.title.replace(/^Recipe #\d+:\s*/, '').trim()) ? 'Saved!' : 'Save Recipe'}
                                                </button>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                                <div class="flex justify-center">
                                  <p class="recipe-note">
                                      Note: The recipes are generated by an AI, so please be aware that the recipes may not be perfect. Use your best judgement and modify the recipe as needed!
                                  </p>
                                </div>
                            </div>
                        {/if}
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