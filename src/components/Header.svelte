<script>

// @ts-nocheck
    import { authHandlers } from "../store/store";
    import { onMount } from 'svelte';
    import { doc, setDoc } from "firebase/firestore";
    import { onAuthStateChanged } from "firebase/auth";
    import { authenticate, db} from "$lib/firebase/firebase";
    import OpenAI from "openai";


    let user = null;
    let isLoading = false;

    const baseURL = 'https://api.spoonacular.com/recipes/';
    

    onMount(() => {
        onAuthStateChanged(authenticate, (currentUser) => {
            if (currentUser) {
                user = currentUser;
            } else {
                user = null;
            }
        });
        
        const generateButton = document.getElementById('generate-button');
        const recipeDisplay = document.getElementById('recipe-display');
        const loader = document.getElementById('loader');

        if (generateButton) {
            generateButton.addEventListener('click', fetchData);
        }

        async function testOpenAiKey() {
            
            const openai = new OpenAI({
                apiKey: import.meta.env.VITE_OPENAI_API_KEY,
                dangerouslyAllowBrowser: true,
            });

            const runPrompt = async () => {
                const prompt = "Give me a recipe based on the ingredients beef, lettuce, and carrots";

                try {
                    const response = await openai.completions.create({
                        model: "text-davinci-003",
                        prompt: prompt,
                        max_tokens: 100,  // Adjusted to provide a more meaningful response
                        temperature: 1,
                    });

                    console.log(response.choices[0].text.trim());
                } catch (error) {
                    console.error("Error in API call:", error);
                }
            };
            runPrompt();
        }

        testOpenAiKey();

        async function fetchData(){
            
            const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;

            const openai = import.meta.env.VITE_OPENAI_API_KEY;
            // @ts-ignore
            let inputIngredients = document.getElementById('ingredient-input').value.trim();
            // @ts-ignore
            let numberIng = parseInt(document.getElementById('number-recipes').value.trim(), 10);

            if (isNaN(numberIng) || numberIng <= 0) {
                numberIng = 4; // Default to 4 recipes if input is invalid
            }

            const fetchNumber = numberIng * 10;
            isLoading = true;
            generateButton.innerHTML = '<div class="loader"></div>';

            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            const url = `${baseURL}findByIngredients?apiKey=${apiKey}&ingredients=${inputIngredients}&number=${fetchNumber}`;
            fetch(url)
            .then(response => {
                if(!response.ok){
                    throw new Error('Network response did not work.')
                }
                return response.json();
            })
            .then(data => {
                let html = "";
                if(Array.isArray(data)){
                    data = shuffleArray(data).slice(0, numberIng);
                    // @ts-ignore
                    data.forEach(recipe =>
                    html += `
                    <div class="recipe-card">
                        <h2>${recipe.title}</h2>
                        <img src="${recipe.image}" alt="Recipe image">
                        <p>Likes: ${recipe.likes || 'Not available'}</p>
                        <div class="button-container">
                            <button class="get-recipe-button" onclick="fetchRecipeDetails(${recipe.id})">Get Recipe</button>
                            <button class="save-recipe-button" onclick="saveRecipe(${recipe.id}, this)">Save Recipe</button>
                        </div>
                    </div>  
                    
                `);
                console.log("Fetched recipes: ", data);
                }
                // @ts-ignore
                recipeDisplay.innerHTML = html;
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                // @ts-ignore
                document.getElementById('recipe-display').innerHTML = '<p>Error fetching recipes. Please try again later.</p>';
            })
            .finally(() => {
                isLoading = false; // Stop loading
                generateButton.innerHTML = 'Generate'; // Restore the button text
            });
        }

        // @ts-ignore
        // @ts-ignore
        window.fetchRecipeDetails = (recipeId) => {
            const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
            const detailUrl = `${baseURL}${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`;


            fetch(detailUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(details => {
                if (details.sourceUrl) {
                    window.open(details.sourceUrl, '_blank');
                } else {
                    alert('No URL available for this recipe.');
                }
                console.log("Fetched details: ", details);
            })
            .catch(error => {
                console.error(`Error fetching details for recipe ID ${recipeId}:`, error);
            });
        }

        // @ts-ignore
        window.saveRecipe = async (recipeID, button) => {
            if (!user) {
                alert("Please log in to save recipes.");
                return;
             }
             
            const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
            const detailUrl = `${baseURL}${recipeID}/information?apiKey=${apiKey}&includeNutrition=false`;
            button.innerHTML = "Saved!";
            button.classList.add('transparent-background');

            try {
                const response = await fetch(detailUrl);
                const data = await response.json();
                const { title, image, sourceUrl, id} = data;

                const recipeData = {
                    title: title || "No title available",
                    image: image || "No image available",
                    sourceUrl: sourceUrl || "No URL available", 
                    id: id || "No id available"
                };

                const recipeRef = doc(db, "users", user.uid, "recipes", `${recipeID}`);

                await setDoc(recipeRef, recipeData);

                // Create styled elements
                const styledTitle = `<h2 class="saved-recipe-title">${recipeData.title}</h2>`;
                const styledImage = `<img src="${recipeData.image}" class="saved-recipe-image" alt="Recipe image">`;

                // Find the corresponding recipe card and update it
                const recipeCard = document.getElementById(`recipe-card-${recipeID}`);
                recipeCard.querySelector('.recipe-title').outerHTML = styledTitle;
                recipeCard.querySelector('.recipe-image').outerHTML = styledImage;

            } catch (error) {
                console.error('Error saving the recipe:', error);
            }
        }
        
});

    function handleLearnMore(){
        const learnMoreLocation = document.getElementById('learn');
        if(learnMoreLocation){
            learnMoreLocation.scrollIntoView({behavior: 'smooth'});
        }
    }

    function handlegetRecipe(){
        const recipeLocation = document.getElementById('recipe');
        if(recipeLocation){
            recipeLocation.scrollIntoView({behavior: 'smooth'});
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
                e.stopPropagation(); // Prevents overlay from toggling when clicking on the menu
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

</script>

<body class="main-container">
    <div id="overlay" class="overlay"></div>
    <div class="nav-container">
        <div class="nav-bar-items">
            <i class="fa-solid fa-vial fa-2x"></i>
            <p class="main-title">Flavify</p>
            <div class="menu-dropdown">
                <div class="menu" id="menu">
                    <button class="profile-icon" tabindex="0">
                        <i class="fa-solid fa-user fa-1x"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="menu-content" id="dropdownContent">
        <button on:click={handleProfile} class="logout-button">
            <a class="text-center" href="#profile">Profile</a>
        </button>
        <button on:click={authHandlers.logout} class="logout-button">
            <a href="#logout">Logout</a>
        </button>
    </div>
    
    <div class="hero-container-box">
        <div class="hero-contain">
            <div class="food-item-images">
                <div class="food-item-1"></div>
                <div class="food-item-2"></div>
                <div class="food-item-3"></div>
                <div class="food-item-4"></div>
            </div>
            <div>
                <h1 class="hero-text">Personalize Your Recipes To Your Taste!</h1>
            </div>
            <p class="description">Create your own custom recipe based on what you have in your pantry, your dietery preferences, and more!</p>
            <div class="button-grid">
                <button on:click= {handleLearnMore} class="learn-more-button">
                    <span class="learn-more-text">Learn more</span>
                </button>
                <button on:click={handlegetRecipe} class="recipe-button">
                    <span class="recipe-text">Get recipe now</span>
                </button>
            </div>
        </div>
    </div>
    <div class="hero-about-container">
        <div class="about-contain">
            <h2 class="why-this-title">
                Why choose Flavify
            </h2>
            <div class="why-container">
                <div class="grid-item-1">
                    <i class="fa-solid fa-bolt fa-2x pb-10"></i>
                    <h2 class="grid-title">Easy to use</h2>
                    <div class="usage-container">
                        <div class="usage-text-contain">
                            <p class="text-black ml-5 mr-5"> → You only need to prepare the ingredients you need.</p>
                            <p class="text-black ml-5 mr-5"> → Have your recipes ready with just one click!</p>
                        </div>
                    </div>
                </div>
                <div class="grid-item-2">
                    <i class="fa-solid fa-money-bill-1 fa-2x pb-10"></i>
                    <h2 class="grid-title">It's completely free</h2>
                    <div class="usage-container">
                        <div class="usage-text-contain">
                            <p class="text-black ml-5 mr-5"> → You do not need to pay a single penny for this app</p>
                            <p class="text-black ml-5 mr-5"> → All features are available to you!</p>
                        </div>
                    </div>
                </div>
                <div class="grid-item-3">
                    <i class="fa-solid fa-face-smile fa-2x pb-10"></i>
                    <h2 class="grid-title">It's user friendly</h2>
                    <div class="usage-container">
                        <div class="usage-text-contain">
                            <p class="text-black ml-5 mr-5"> → The user interface of this app is minimal and modern</p>
                            <p class="text-black ml-5 mr-5"> → Users of all ages can navigate the page easily</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div>
        <div class="layout">
            <main>
                <div>
                    <div class="contain-box">
                        <div class="grid-box">
                            <div class="actual-content">
                                <div class="main-content">
                                    <div id="learn" class="learn-section">
                                        <h1 class="text-4xl font-mono pb-100 mt-20">
                                            How It Works
                                        </h1>
                                    </div>
                                </div>
                                <div class="how-container">
                                    <div class="step">
                                        <div class="step-content">
                                            <h2 class="text-xl pt-10 pl-10">Input Ingredients</h2>
                                            <p class="pl-10 pt-5"> → Input your available ingredients in the ingredients box</p>
                                            <p class="pl-10 pt-5 pb-10"> → Click add to add the ingredients</p>
                                        </div>
                                        <div class="step-image">
                                        </div>
                                    </div>
                                    <div class="step">
                                        <div class="step-content">
                                            <h2 class="text-xl pt-10 pl-10">Select Preference</h2>
                                            <p class="pl-10 pt-5 pb-10"> → Select your dietary preferences for customized options.</p>
                                        </div>
                                        <div class="step-image-1">
                                        </div>
                                    </div>
                                    <div class="step">
                                        <div class="step-content">
                                            <h2 class="text-xl pt-10 pl-10">Enjoy</h2>
                                            <p class="pl-10 pt-5 pb-10"> → Click generate to enjoy various recipe possibilities.</p>
                                        </div>
                                        <div class="step-image-2">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
        <div class="benefit-container">
        </div>
        <div class="layout">
            <div class="gen-container">                                
                <div class="about-contain-1">
                    <div class="gen-box">
                        <div id="recipe" class="actual-input-box">
                            <p class="input-text">Input Here</p>
                            <div class="finger-container">
                                <i class="finger">👇</i>
                            </div>
                            <div class="input-ing">
                                <input type="text" id="ingredient-input" placeholder="Enter ingredients...">
                            </div>
                            <div class="input-ing">
                                <input type="text" id="number-recipes" placeholder="Enter the number of recipes...">
                            </div>
                            <button id="generate-button" class="gen-button">Generate</button>           
                        </div>
                        <div class="output-box">
                            <p class="input-text">Your Recipes</p>
                            <div class="actual-output" id="recipe-display"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <div class="w-full h-40 bg-black">
        <div class="socials-container">
            <a href="https://github.com/benniu04" target="_blank" class="socials-icon"><i class="fa fa-github fa-2x text-white"></i></a>
            <a href="https://www.instagram.com/benny_niu327/" target="_blank" class="socials-icon"><i class="fa fa-instagram fa-2x text-white"></i></a>
            <a href="https://www.linkedin.com/in/ben-niu-244820230/" target="_blank" class="socials-icon"><i class="fa fa-linkedin-square fa-2x text-white"></i></a>
            <a href="https://codepen.io/benniu04" target="_blank" class="socials-icon"><i class="fa fa-codepen fa-2x text-white"></i></a>
        </div>
        <div class="socials-container">
            <p class="socials-text">Website  Designed  By  Ben  Niu</p>
        </div>
        <div class="flex justify-center ">
            <p class="socials-text">nub38bn@gmail.com</p>
        </div>
    </div>
    
</body>
