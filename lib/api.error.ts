import { NextResponse } from "next/server";

export class ApiError extends Error {
  public statusCode: number;
  public data: any | null;
  public success: boolean;
  public errors: any[];

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: any[] = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Handles generic errors and ApiErrors, formatting them consistently for Next.js.
   * @param error The caught error
   * @returns NextResponse
   */
  static handle(error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: error.success,
          message: error.message,
          errors: error.errors,
          data: error.data,
        },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        errors: [errorMessage],
        data: null
      },
      { status: 500 }
    );
  }
}
