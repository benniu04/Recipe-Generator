<script>
    import { onMount } from "svelte";

    function toggleOverlay() {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.classList.toggle('active');
        }
    }

    function toggleMenu() {
        const menuContent = document.getElementById('dropdownContent');
        const overlay = document.getElementById('overlay');

        if (!menuContent || !overlay) return;

        if (menuContent.classList.contains('active')) {
            menuContent.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            menuContent.classList.add('active');
            overlay.classList.add('active');
        }
    }

    function handleLearnMore() {
        const learnMoreLocation = document.getElementById('learn');
        if (learnMoreLocation) {
            learnMoreLocation.scrollIntoView({ behavior: 'smooth' });
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

        if (overlay && menuContent) {
            overlay.addEventListener('click', () => {
                overlay.classList.remove('active');
                menuContent.classList.remove('active');
            });
        }

        if (menuContent) {
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
            <ul class="login-out-container">
                <li><a class="login-button text-center font-bold w-full sm:w-auto px-4 py-2" href="/Auth">Already have an account?</a></li>
                <li><a class="login-button text-center font-bold w-full sm:w-auto px-4 py-2" href="/Auth">Register</a></li>
            </ul>
            <div class="menu-dropdown">
                <div id="menu" class="menu">
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="menu-content" id="dropdownContent">
        <button class="logout-button">
            <a class="text-center" href="/Auth">Already have an account?</a>
        </button>
        <button class="logout-button">
            <a class="text-center" href="/Register">Register</a>
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
                <button on:click={handleLearnMore} class="learn-more-button">
                    <span class="learn-more-text">Learn more</span>
                </button>
                <button class="recipe-button">
                    <a class="recipe-text" href="/Register">Try it now</a>
                </button>
            </div>
        </div>
    </div>

    <div class="hero-about-container">
        <div class="about-contain">
            <h2 class="why-this-title">Why choose Flavify</h2>
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
                                        <h1 class="text-4xl font-mono pb-100 mt-20">How It Works</h1>
                                    </div>
                                </div>
                                <div class="how-container">
                                    <div class="step">
                                        <div class="step-content">
                                            <h2 class="text-xl pt-10 pl-10">Input Ingredients</h2>
                                            <p class="pl-10 pt-5"> → Input your available ingredients in the ingredients box</p>
                                            <p class="pl-10 pt-5 pb-10"> → Click add to add the ingredients</p>
                                        </div>
                                        <div class="step-image"></div>
                                    </div>
                                    <div class="step">
                                        <div class="step-content">
                                            <h2 class="text-xl pt-10 pl-10">Select Preference</h2>
                                            <p class="pl-10 pt-5 pb-10"> → Select your dietary preferences for customized options.</p>
                                        </div>
                                        <div class="step-image-1"></div>
                                    </div>
                                    <div class="step">
                                        <div class="step-content">
                                            <h2 class="text-xl pt-10 pl-10">Enjoy</h2>
                                            <p class="pl-10 pt-5 pb-10"> → Click generate to enjoy various recipe possibilities.</p>
                                        </div>
                                        <div class="step-image-2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
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
            <p class="socials-text">Website  By  Ben  Niu</p>
        </div>
        <div class="flex justify-center">
            <p class="socials-text">nub38bn@gmail.com</p>
        </div>
    </div>
</body>