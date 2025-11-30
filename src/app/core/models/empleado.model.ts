export interface Empleado {
  id: number;
  nombre: string;
  puesto: string;
  contrasena: string;
}

export const emptyEmpleado = (): Empleado => ({
  id: 0,
  nombre: '',
  puesto: '',
  contrasena: ''
});
