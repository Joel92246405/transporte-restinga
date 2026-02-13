import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Enquanto verifica
  if (user === undefined) {
    return <div className="text-center mt-5">Verificando...</div>;
  }

  // Se não estiver logado
  if (!user || !user.email) {
    return <Navigate to="/login" />;
  }

  return children;
}
