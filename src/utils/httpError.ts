/* Error con código HTTP para lanzarlo desde controladores
y que el errorHandler responda con el status correcto.*/
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
