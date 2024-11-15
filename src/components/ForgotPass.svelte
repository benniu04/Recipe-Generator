<script>
    import { tick } from "svelte";
    import { fade } from "svelte/transition";
    import { authenticate } from "$lib/firebase/firebase";
    import { sendPasswordResetEmail } from "firebase/auth";
    
    let email = "";
    let successMessage = "";

    /**
   * @param {{ preventDefault: () => void; }} event
   */
    async function handlePasswordReset(event) {
        event.preventDefault();
            
        try {
            await sendPasswordResetEmail(authenticate, email);
            successMessage = 'Password reset email sent successfully';

            await tick();
            setTimeout(() => successMessage = '', 2000);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
</script>

<div class="login-background">
    <div class="logo-container">
        <div class="actual-logo-container">
            <i class="fa-solid fa-kitchen-set fa-2x"></i>
        </div>
    </div>
    <div class="flex justify-center items-center gap-x-40 min-h-screen">
        <div class="login-container">
            <div class="w-[420px] bg-transparent rounded-xl px-[30px] py-[50px]">
                <form on:submit={handlePasswordReset}>
                    <h1 class="text-left text-xl font-bold pb-10">Forgot Your Password?</h1>
                    <p>Please enter the email address that you'd like your password reset information sent to</p>
                    <div class="w-[100%] h-[50px] my-[30px] mx-0">
                        <input 
                            bind:value={email}
                            class="input-box"
                            type="email" 
                            placeholder="Your email"
                            required
                        >
                    </div>
                    <button 
                        type="submit"
                        class="w-full h-[45px] bg-white border-0 rounded-[40px] shadow cursor-pointer text-base text-gray-800 font-semibold focus:outline-none"
                    >
                        Request reset link
                    </button>
                    <div class="pt-10 flex justify-center items-center back-to-button">
                        <a class="text-center font-bold" href="/Auth">Back to Login</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
    {#if successMessage}
        <div class="reset-message" transition:fade>{successMessage}</div>
    {/if}
</div>