import CustomError from './custom.error';

// Custom error for when order ID is not provided
export class MissingOrderIdError extends CustomError {
    constructor() {
        super(400, `Bad request - Missing "orderId" in the request body.`);
    }
}

// Custom error for when the order is not found
export class OrderNotFoundError extends CustomError {
    constructor(orderId: string) {
        super(404, `Order with ID: ${orderId} is not found.`);
    }
}

// Custom error for any failure in fetching the order
export class FetchOrderError extends CustomError {
    constructor(orderId: string) {
        super(500, `Failed to fetch the order with ID: ${orderId} due to an internal server error.`);
    }
}

// Custom error for handling invalid response structure
export class InvalidOrderResponseError extends CustomError {
    constructor() {
        super(500, `The order response structure is invalid or missing required fields.`);
    }
}
export class InvalidOrderState extends CustomError {
    constructor() {
        super(400, `Invalid order state!`);
    }
}
