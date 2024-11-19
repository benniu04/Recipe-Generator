import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { writable } from "svelte/store";
import { authenticate } from "$lib/firebase/firebase";

export const authStore = writable({
    user: null,
    loading: true,
    data: {}
})

export const authHandlers = {
    // @ts-ignore
    signup: async (email, pass) => {
        await createUserWithEmailAndPassword(authenticate, email, pass)
    },
    // @ts-ignore
    login: async (email, pass) => {
        await signInWithEmailAndPassword(authenticate, email, pass)
    },
    logout: async () => {
        await signOut(authenticate)
    }
}






