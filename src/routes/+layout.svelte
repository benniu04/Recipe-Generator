<script>
  import "../app.css";
  import "../login.css";
  import { onMount } from "svelte";
  import { authenticate, db } from "$lib/firebase/firebase";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  import { authStore } from "../store/store";

  const nonAuthRoutes = ["/Auth", "/product", "/", "/Register"];

  onMount(() => {
    console.log('Mounted');
    const unsubscribe = authenticate.onAuthStateChanged(async (user) => {
        const currentPath = window.location.pathname;

        if (!user && !nonAuthRoutes.includes(currentPath)) {
          window.location.href = "/";
        }

        if (user && currentPath === "/Auth") {
          window.location.href = "/dashboard";
          return;
        }

        if (!user) {
          return;
        }

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        /**
       * @type {import("@firebase/firestore").DocumentData}
       */
        let dataToSetToStore;
        if (!docSnap.exists()) {
          dataToSetToStore = {
            email: user.email,
            todos: [],
          };
          await setDoc(docRef, dataToSetToStore, {merge: true});
        } else {
          dataToSetToStore = docSnap.data();
        }

        // Assuming you have an authStore for Svelte context or writable store
        // Update it with the new state
        // @ts-ignore
        authStore.update((curr) => {
          return {
            ...curr,
            user: user,
            data: dataToSetToStore,
            loading: false,
          };
        });
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<slot />
