<div style="width:100%">
   <img src="./notify/public/notify_logo.jpg" />
</div>

## Notify

This connector is designed to automate real-time order status notifications for customers. It listens for changes to order statuses in CommerceTools and automatically sends WhatsApp notifications to customers via [Twilio ](https://www.twilio.com/)when an order confirmed.Also logs the the notifications send.

## Instructions

These are the steps to run the application:

1. **Install Dependencies:** Install the dependencies by running `yarn` in the root directory.
2. **Create commercetools API client keys:** Ensure that you create the API client keys with the correct scope (***manage\_project***).
3. **Create [Twilio](https://www.twilio.com/) API Credentials:** Create the API credentials for your Twilio account.
4. **Create .env file:** Create a .env file in the root directory and fill in the required environment variables. See the sample .env.example file for reference.
5. move to `cd poc-orders-notifications/notify`
6. run `ỳarn start:dev` to build the application.
