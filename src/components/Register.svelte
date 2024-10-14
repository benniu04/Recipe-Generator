<script>
    import { goto } from "$app/navigation";
    import { authHandlers } from "../store/store";
  
    let email = "";
    let password = "";
    let confirmPass = "";
    let error = false;
    let errorMessage = "";
    let authenticating = false;
  
    /**
   * @param {{ preventDefault: () => void; }} event
   */
    async function handleRegister(event) {
        event.preventDefault();
        
        // Check if currently authenticating to prevent multiple submissions
        if (authenticating) {
            return;
        }
        
        // Basic validation checks
        if (!email || !password || !confirmPass) {
            error = true;
            errorMessage = "All fields are required.";
            return;
        }
  
        if (password.length < 6) {
            error = true;
            errorMessage = "This is a weak password, please enter a password greater than 6 characters.";
            return;
        }
  
        if (password !== confirmPass) {
            error = true;
            errorMessage = "Passwords do not match.";
            return;
        }
  
        authenticating = true;
        error = false;
        errorMessage = "";
  
        try {
            console.log("Attempting to sign up with email:", email);
            await authHandlers.signup(email, password);
            console.log("Signup successful, navigating to /Auth");
            goto('/Auth'); // Redirecting to the Auth page
        } catch (err) {
            console.log("There was an error during signup:", err);
            error = true;
            errorMessage = "There was an error during registration. Please try again.";
        } finally {
            authenticating = false;
        }
    }
  </script>
  
  <!-- Svelte components don't use the <head> and <body> tags. Style links should be placed in the <head> of your HTML entry point or use global styles. -->
  
  <div class="login-background">
      <div class="logo-container">
          <div class="actual-logo-container">
              <i class="fa-solid fa-kitchen-set fa-2x"></i> <!-- Ensure you have the correct setup for FontAwesome icons -->
          </div>
      </div>
      <div class="flex justify-center items-center gap-x-40 min-h-screen">
          <div class="login-container">
              <div class="w-[420px] bg-transparent rounded-xl px-[40px] py-[80px]">
                  <form on:submit={handleRegister}>
                      <h1 class="text-center text-xl font-bold">Register</h1>
                      {#if error}
                          <p class="error">{errorMessage}</p>
                      {/if}
                      <div class="w-[100%] h-[50px] my-[30px] mx-0">
                          <input bind:value={email} class="input-box" placeholder="Email" required>
                      </div>
                      <div class="w-[100%] h-[50px] my-[30px] mx-0">
                          <input bind:value={password} class="input-box" type="password" placeholder="Password" required>
                      </div>
                      <div class="w-[100%] h-[50px] my-[30px] mx-0">
                          <input bind:value={confirmPass} class="input-box" type="password" placeholder="Confirm Password" required>
                      </div>
                      <button type="submit" class="w-full h-[45px] bg-white border-0 rounded-[40px] shadow cursor-pointer text-base text-gray-800 font-semibold focus:outline-none">
                          {#if authenticating}
                              <i class="fa-solid fa-spinner spin"></i>
                          {:else}
                              Register
                          {/if}
                      </button>
                  </form>
                  <div class="options">
                      <p>Or</p>
                      <div>
                          <p>Already have an account?</p>
                          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                          <a href="/Auth" class="login-text">Login</a>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  