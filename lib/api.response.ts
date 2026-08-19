import { NextResponse } from "next/server";

export class ApiResponse<T = unknown> {
  public statusCode: number;
  public data: T;
  public message: string;
  public success: boolean;

  constructor(statusCode: number, data: T, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  /**
   * Generates a standard Next.js JSON response for a successful operation.
   * @param data The payload data to return
   * @param message A success message
   * @param statusCode HTTP status code (default: 200)
   * @returns NextResponse
   */
  static success<T>(data: T, message = "Success", statusCode = 200) {
    return NextResponse.json({ success: true, data, message }, { status: statusCode });
  }
}
