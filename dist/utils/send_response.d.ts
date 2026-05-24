import type { Response } from "express";
interface ResponseInterface<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
}
export declare function sendResponse<T>(res: Response, responseData: ResponseInterface<T>): void;
export {};
//# sourceMappingURL=send_response.d.ts.map