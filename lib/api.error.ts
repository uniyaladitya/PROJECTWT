import { NextResponse } from "next/server";

export class ApiError extends Error {
  public statusCode: number;
  public data: unknown | null;
  public success: boolean;
  public errors: unknown[];

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: unknown[] = [],
    stack = "",
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
        { success: false, data: null, error: { code: error.statusCode, message: error.message } },
        { status: error.statusCode },
      );
    }

    // Handle Zod validation errors
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, data: null, error: { code: 400, message: "Validation Error" } },
        { status: 400 },
      );
    }

    console.error("Unhandled API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      { success: false, data: null, error: { code: 500, message: errorMessage } },
      { status: 500 },
    );
  }
}
