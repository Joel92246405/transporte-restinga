import { auth, db } from "./firebase";
import {
  doc,
  setDoc,
  increment
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

function waitForAuth() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      }
    });
  });
}

function generateRandomId(length = 5) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export async function registerAccess() {
  try {
    let user = auth.currentUser;

    if (!user) {
      await signInAnonymously(auth);
      user = await waitForAuth();
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");
    const millisecond = now.getMilliseconds()
      .toString()
      .padStart(3, "0");

    // ID único (timestamp + random)
    const accessId = `${hour}:${minute}:${second}:${millisecond}-${generateRandomId()}`;

    console.log("Registrando acesso:", today, accessId);

    const dayRef = doc(db, "analytics", today);
    const userRef = doc(db, "analytics", today, "users", user.uid);
    const accessRef = doc(
      db,
      "analytics",
      today,
      "users",
      user.uid,
      "accesses",
      accessId
    );

    // 🔢 Incrementa total do dia
    await setDoc(
      dayRef,
      {
        totalAccess: increment(1),
        updatedAt: now
      },
      { merge: true }
    );

    // 🔢 Incrementa total do usuário
    await setDoc(
      userRef,
      {
        count: increment(1),
        lastAccess: now
      },
      { merge: true }
    );

    // 🕒 Cria documento individual do acesso
    await setDoc(accessRef, {
      timestamp: now,
      hour: Number(hour),
      minute: Number(minute),
      second: Number(second),
      millisecond: Number(millisecond)
    });

    console.log("Analytics registrado com sucesso");

  } catch (error) {
    console.error("Erro ao registrar analytics:", error);
  }
}
