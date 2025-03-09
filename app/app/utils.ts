import { isRouteErrorResponse } from "@remix-run/react";

export const getErrorDescription = (error: unknown) => {
  if (isRouteErrorResponse(error)) {
    return error.data.error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
};
