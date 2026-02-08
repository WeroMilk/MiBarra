"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, useFirebase } from "@/lib/firebase";
import { demoAuth, DEMO_USERS } from "@/lib/demoAuth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (useFirebase && auth) {
        // Usar Firebase real
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      } else {
        // Usar modo demo
        if (isLogin) {
          await demoAuth.signIn(email, password);
        } else {
          await demoAuth.signUp(email, password);
        }
      }
      router.push("/set-bar-name");
    } catch (err: any) {
      setError(err.message || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-apple-bg">
      <div className="w-full max-w-md">
        <div className="bg-apple-surface rounded-3xl shadow-xl border border-apple-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold text-apple-text mb-2">MiBarra</h1>
            <p className="text-apple-text2">Gestión Profesional de Bar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-apple-text mb-2">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-apple-surface2 border border-apple-border rounded-xl text-apple-text placeholder-apple-text2 focus:outline-none focus:ring-2 focus:ring-apple-accent focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-apple-text mb-2">
                Contraseña
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-apple-surface2 border border-apple-border rounded-xl text-apple-text placeholder-apple-text2 focus:outline-none focus:ring-2 focus:ring-apple-accent focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-apple-accent hover:bg-apple-accent/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-apple-accent hover:text-apple-accent/80 text-sm transition-colors"
            >
              {isLogin
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>

          {!useFirebase && (
            <div className="mt-6 pt-6 border-t border-apple-border">
              <p className="text-xs text-apple-text2 text-center mb-3">
                🔧 Modo DEMO - Usuarios de prueba:
              </p>
              <div className="space-y-2">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => {
                      setEmail(user.email);
                      setPassword(user.password);
                      setIsLogin(true);
                    }}
                    className="w-full text-center px-3 py-2 bg-apple-surface2 hover:bg-apple-border/50 rounded-xl text-xs text-apple-text hover:text-apple-accent transition-colors border border-apple-border"
                  >
                    <span className="font-medium">{user.email}</span>
                    <span className="text-apple-text2"> / </span>
                    <span className="font-medium">{user.password}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-apple-text2 text-center mt-3">
                Haz clic en un usuario para autocompletar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
