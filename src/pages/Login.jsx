import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/admin");
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/admin");
    } catch (error) {
      alert("Email ou senha inválidos");
    }
  }

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h3 className="mb-3 text-center">Login Administrativo</h3>

        <form onSubmit={handleLogin}>
          <input
            className="form-control mb-2"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Senha"
            onChange={(e) => setSenha(e.target.value)}
          />

          <button className="btn btn-primary w-100 mb-2">
            Entrar
          </button>
        </form>

        <Link to="/" className="btn btn-outline-secondary w-100">
          Voltar para Página Inicial
        </Link>
      </div>
    </div>
  );
}
