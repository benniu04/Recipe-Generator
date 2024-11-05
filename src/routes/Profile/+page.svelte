<script>
    // @ts-nocheck
    import { onMount, tick } from 'svelte';
    import { db, authenticate } from '$lib/firebase/firebase';
    import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
    import { onAuthStateChanged } from "firebase/auth";
    import { authHandlers } from "../../store/store";
    import { fade } from 'svelte/transition';

    let user = null;
    let recipes = [];
    let successMessage = '';

    onMount(() => {
        onAuthStateChanged(authenticate, (currentUser) => {
            if (currentUser) {
                user = currentUser;
                fetchSavedRecipes();
            } else {
                user = null;
            }
        });

        setupMenuHandlers();
    });

    async function fetchSavedRecipes() {
        if (!user) return;

        const recipesCollection = collection(db, "users", user.uid, "recipes");
        const recipeSnapshot = await getDocs(recipesCollection);
        recipes = recipeSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log("Fetched recipes:", recipes);
    }

    async function deleteRecipe(recipeId) {
        try {
            if (!user) return;

            const recipeIdStr = String(recipeId);
            const recipeRef = doc(db, "users", user.uid, "recipes", recipeIdStr);
            await deleteDoc(recipeRef);
            
            recipes = recipes.filter(recipe => recipe.id !== recipeId);
            successMessage = 'Recipe deleted successfully!';

            await tick();
            setTimeout(() => {
                successMessage = '';
            }, 2000);

            console.log("Deleted recipe with ID:", recipeId);
        } catch (error) {
            console.error("Error deleting recipe with ID:", recipeId, error);
        }
    }

    function redirectHome() {
        window.location.href = "/dashboard";
    }

    function handleProfile() {
        window.location.href = "/Profile";
    }

    function fetchRecipeURL(sourceUrl) {
        if (sourceUrl) {
            window.open(sourceUrl, '_blank');
        } else {
            alert('No URL available for this recipe.');
        }
    }

    function toggleMenu() {
        const menuContent = document.getElementById('dropdownContent');
        const overlay = document.getElementById('overlay');
        
        menuContent.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    function setupMenuHandlers() {
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
                menuContent?.classList.remove('active');
            });
        }

        if (menuContent) {
            menuContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
</script>

<body class="main-container">
    <div id="overlay" class="overlay"></div>
    <div class="nav-container">
        <div class="nav-bar-items">
            <i class="fa-solid fa-vial fa-2x"></i>
            <button on:click={redirectHome} class="main-title">Flavify</button>
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

    <div>
        <div class="flex justify-center pb-5">
            <button class="saved-button">
                Your Saved Recipes
            </button>
        </div>
        <div class="main-content-1">
            {#if user}
                {#each recipes as recipe (recipe.id)}
                    <div class="recipe-card">
                        <h2 class="saved-recipe-title">{recipe.title}</h2>
                        {@html recipe.recipeText.split('\n').join('<br>')}
                        <div class="button-container">
                            <button class="get-recipe-button" on:click={() => deleteRecipe(recipe.id)}>
                                Delete Recipe
                            </button>
                        </div>
                    </div>
                {/each}
            {:else}
                <p>Please log in to view your saved recipes.</p>
            {/if}
        </div>
        {#if successMessage}
            <div class="success-message" transition:fade>{successMessage}</div>
        {/if}
    </div>
</body>