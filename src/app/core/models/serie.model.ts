export interface Serie {
  id: number;
  titulo: string;
  temporadas: number;
}

export const emptySerie = (): Serie => ({
  id: 0,
  titulo: '',
  temporadas: 1
});
