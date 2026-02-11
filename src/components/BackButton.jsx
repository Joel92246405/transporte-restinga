import { useNavigate } from "react-router-dom";

export default function BackButton({ to, label }) {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn-outline-secondary mb-3"
      onClick={() => navigate(to)}
    >
      ← {label}
    </button>
  );
}