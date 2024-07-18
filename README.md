# ServiceHub

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Testing Payment](#testing-payment)
4. [Accessing Existing User Accounts](#accessing-existing-user-accounts)
5. [Creating New Accounts](#creating-new-accounts)
6. [Accessing Admin Account](#accessing-admin-account)

## Introduction

ServiceHub is a platform designed to connect service consumers and service providers, bridging the gap between the demand and supply of basic services. It offers a one-stop platform where services can be listed, compared, and booked.

## Installation


1. From the `prototype` directory, run the following command:
   ```bash
   docker compose up --build
    ```
    Then both the front and backend should be running and you can reach the frontend at 
    ```localhost:3000```



### Testing Payment

- For testing transition to the premium service we have in our app, stripe CLI has to be installed with a valid account in order to forward the webhooks from Stripe to the local server. For that please run in the terminal: 
 ```bash
  stripe listen --forward-to http://localhost:8080/webhook
 ```
 - Then the new test key and the webhook secrets can be injected via
 ```bash
 docker-compose up -d \
  -e STRIPE_SECRET_KEY=new_sk_test_XXXXXXXXXXXXXXXXXXXXXXXX \
  -e STRIPE_WEBHOOK_SECRET=new_whsec_XXXXXXXXXXXXXXXXXXXXXXXX
```

### Accessing existing user accounts
- Any account on the platform follows the credentials convention of:
- email: `firstlastname@gmail.com`
- password: `securepassword`

### Creating new accounts
- We use OTPs to ensure that users who sign up for the platform do so with valid email addresses. To create a new account on the platform, make sure the email address can receive OTPs and other triggered emails, such as those for booking a service.


### Accessing Admin account
- We have one admin account that is responsible for viewing user details but most importatntly, verifying the certificates of the service providers that they upload for their certificates. 
- This account can be logged in using:
- email: `servicehub.seba22@gmail.com`
- Password: `AdminServiceHub`