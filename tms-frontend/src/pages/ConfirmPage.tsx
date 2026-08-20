import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { confirmSignUp } from "../api/auth";

export function ConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al confirmar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Confirmar cuenta</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="code">Código de confirmación</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Confirmando..." : "Confirmar"}
        </button>
      </form>
      <p>
        ¿Ya confirmaste? <Link to="/login">Iniciar sesión</Link>
      </p>
    </div>
  );
}