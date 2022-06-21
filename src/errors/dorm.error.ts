export class DormError extends Error implements Error {
  name: string;
  message: string;
  stack?: string;

  code: string;
  data?: any;

  constructor(code: string, message?: string, data?: any) {
    super();
    this.name = "DormError";
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

export namespace DormError {
  export const isDormError = (obj: any): boolean => obj instanceof DormError;

  export const MODEL_VALIDATION_ERROR = (
    msg?: string,
    data?: any
  ): DormError => {
    return new DormError("MODEL_VALIDATION_ERROR", msg, data);
  };
}
