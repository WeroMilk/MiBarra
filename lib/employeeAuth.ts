/**
 * Contraseña por empleado para registrar quién hace cada movimiento.
 * En producción esto vendría de configuración segura.
 */

export interface Employee {
  id: string;
  label: string;
  password: string;
}

export const EMPLOYEES: Employee[] = [
  { id: "Gerente", label: "Gerente", password: "gerente123" },
  { id: "001", label: "ID 001", password: "empleado001" },
  { id: "002", label: "ID 002", password: "empleado002" },
];

export const employeeAuth = {
  /**
   * Valida la contraseña y devuelve el empleado (id + label) o null.
   */
  validate: (password: string): { id: string; label: string } | null => {
    const trimmed = password.trim();
    const employee = EMPLOYEES.find((e) => e.password === trimmed);
    if (employee) return { id: employee.id, label: employee.label };
    return null;
  },

  getAll: (): Employee[] => [...EMPLOYEES],
};
