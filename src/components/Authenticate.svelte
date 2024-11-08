<script>
    import { authHandlers } from "../store/store";
    import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";
    import { authenticate } from "$lib/firebase/firebase";
  
    let email = "";
    let password = "";
    let confirmPass = "";
    let error = false;
    let errorMessage = "";
    let register = false;
    let authenticating = false;

    // @ts-ignore
    async function handleAuthenticate(event) {
        event.preventDefault();
        if (authenticating) return;

        if (!email || !password || (register && !confirmPass)) {
            error = true;
            errorMessage = "All fields are required.";
            return;
        }

        if (register && password.length < 6) {
            error = true;
            errorMessage = "This is a weak password, please enter a password greater than 6 characters";
            return;
        }

        if (register && (password !== confirmPass || !confirmPass)) {
            error = true;
            errorMessage = "Passwords do not match.";
            return;
        }

        authenticating = true;
        error = false;
        errorMessage = "";

        try {
            if (!register) {
                await authHandlers.login(email, password);
            } else {
                await authHandlers.signup(email, password);
            }
        } catch (err) {
            console.log("There was an error", err);
            error = true;
            errorMessage = !register 
                ? "Password is incorrect, please try again"
                : "There was an error during registration. Please try again.";
        } finally {
            authenticating = false;
        }
    }

    function handleRegister() {
        register = !register;
        error = false;
    }

    async function handleGoogleSignIn() {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(authenticate, provider);
        } catch (error) {
            console.error("Google sign-in error:", error);
            error = true;
            errorMessage = "Failed to sign in with Google. Please try again.";
        }
    }

    async function handleGithubSignIn() {
        try {
            const provider = new GithubAuthProvider();
            await signInWithPopup(authenticate, provider);
        } catch (error) {
            console.error("GitHub sign-in error:", error);
            error = true;
            errorMessage = "Failed to sign in with GitHub. Please try again.";
        }
    }
</script>

<!-- Svelte components don't use the <head> and <body> tags. Style links should be placed in the <head> of your HTML entry point or use global styles. -->

<div class="login-background">
    <div class="logo-container">
        <div class="actual-logo-container">
            <i class="fa-solid fa-kitchen-set fa-2x"></i>
        </div>
    </div>
    <div class="flex justify-center items-center gap-x-40 min-h-screen">
        <div class="login-container">
            <div class="w-[420px] bg-transparent rounded-xl px-[40px] py-[80px]">
                <h1 class="text-center text-xl font-bold text-white font-libre">{register ? 'Register' : 'Login'}</h1>
                
                <!-- OAuth buttons -->
                <div class="mt-4 mb-4 flex flex-col gap-3">
                    <button 
                        on:click={handleGoogleSignIn}
                        class="w-full h-[45px] bg-white border border-gray-300 rounded-[40px] shadow cursor-pointer text-base text-gray-800 font-semibold focus:outline-none flex items-center justify-center gap-2"
                    >
                        <i class="fab fa-google"></i>
                        Continue with Google
                    </button>

                    <button 
                        on:click={handleGithubSignIn}
                        class="w-full h-[45px] bg-white border border-gray-300 rounded-[40px] shadow cursor-pointer text-base text-gray-800 font-semibold focus:outline-none flex items-center justify-center gap-2"
                    >
                        <i class="fab fa-github"></i>
                        Continue with GitHub
                    </button>
                </div>

                <form on:submit={handleAuthenticate}>
                    {#if error}
                        <p class="error">{errorMessage}</p>
                    {/if}
                    <div class="w-[100%] h-[50px] my-[30px] mx-0">
                        <input bind:value={email} class="input-box" placeholder="Username" required style="color: white; placeholder-color: white;">
                    </div>
                    <div class="w-[100%] h-[50px] my-[30px] mx-0">
                        <input bind:value={password} class="input-box" placeholder="Password" required style="color: white; placeholder-color: white;">
                    </div>
                    {#if register}
                        <div class="w-[100%] h-[50px] my-[30px] mx-0">
                            <input bind:value={confirmPass} class="input-box" placeholder="Confirm Password" required>
                        </div>
                    {/if}
                    <button type="submit" class="w-full h-[45px] bg-white border-0 rounded-[40px] shadow cursor-pointer text-base text-gray-800 font-semibold focus:outline-none">
                        {#if authenticating}
                            <i class="fa-solid fa-spinner spin"></i>
                        {:else}
                            Submit
                        {/if}
                    </button>
                </form>

                <div class="options">
                    <p class="font-bold text-white">Or</p>
                    {#if register}
                        <div>
                            <p class="font-bold text-blue">Already have an account?</p>
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <p class="login-text" on:click={handleRegister} on:keydown={() => {}}>Login</p>
                        </div>
                    {:else}
                        <div class="text-center cursor-pointer">
                            <a href="/ForgotPass" class="forgot-text">Forgot my password?</a>
                        </div>
                        <div>
                            <p class="text-blue-500">Don't have an account?</p>   
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <p class="register-text" on:click={handleRegister} on:keydown={() => {}}>Register</p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .fab.fa-google {
        color: #4285f4;
    }
    .fab.fa-github {
        color: #333;
    }
</style>