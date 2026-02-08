"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/Auth/AuthGuard";
import LogoutButton from "@/components/Auth/LogoutButton";
import { demoAuth } from "@/lib/demoAuth";
import { movementsService } from "@/lib/movements";

export default function SetBarNamePage() {
  const [barName, setBarName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = demoAuth.getCurrentUser();
    if (user?.barName) setBarName(user.barName);
  }, []);

  const handleContinue = () => {
    const name = barName.trim();
    if (!name) {
      alert("Por favor ingresa el nombre de tu bar");
      return;
    }
    const oldName = demoAuth.getCurrentUser()?.barName ?? "";
    demoAuth.updateBarName(name);
    movementsService.add({
      type: "bar_name_change",
      bottleId: "_",
      bottleName: "Nombre del bar",
      newValue: 0,
      userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
      description: oldName ? `«${oldName}» → «${name}»` : `Nombre del bar: «${name}»`,
    });
    router.push("/select-bottles");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-apple-bg p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-apple-surface rounded-3xl shadow-xl border border-apple-border p-8 relative">
            <div className="absolute top-4 right-4">
              <LogoutButton showText={false} />
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-apple-text mb-2">
                Nombre de tu bar
              </h1>
              <p className="text-apple-text2 text-sm">
                Este nombre se mostrará siempre debajo del título &quot;MiBarra&quot; en la barra.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  Nombre del bar
                </label>
                <input
                  id="set-bar-name"
                  name="barName"
                  type="text"
                  value={barName}
                  onChange={(e) => setBarName(e.target.value)}
                  placeholder="Ej: Bar El Patrón"
                  className="w-full px-4 py-3 bg-apple-surface2 border border-apple-border rounded-xl text-apple-text placeholder-apple-text2 focus:outline-none focus:ring-2 focus:ring-apple-accent focus:border-transparent"
                />
              </div>

              <button
                onClick={handleContinue}
                disabled={!barName.trim()}
                className="w-full bg-apple-accent hover:bg-apple-accent/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar al inventario
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
