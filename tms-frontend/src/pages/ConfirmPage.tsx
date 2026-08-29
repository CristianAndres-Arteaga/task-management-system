import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { confirmSignUp } from "../api/auth";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

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
    <AuthLayout
      title="Confirmar cuenta"
      footer={
        <>
          ¿Ya confirmaste?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
            Email
          </label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-text-secondary mb-1">
            Código de confirmación
          </label>
          <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        <Button type="submit" isLoading={loading}>
          {loading ? "Confirmando..." : "Confirmar"}
        </Button>
      </form>
    </AuthLayout>
  );
}