# K8sCommerce

## Overview

K8sCommerce is a microservices-based e-commerce application built using Node.js, Express, MongoDB, Redis and Nats Streaming. The application is designed to be deployed on a Kubernetes cluster and includes several services such as authentication, product management, order management, payment processing, and expiration handling.

You need to run Kubernetes on your docker desktop. You would also need to setup some secrets when your cluster is up and running.

1. First secret reqd is jwt-secret setup under the key value pair - JWT_KEY:'asdf'
2. Second secret reqd is stripe-secret setup under the key value pair - STRIPE_KEY:"YOUR STRIPE API SECRET"

Ingress resources needs to be installed after setting up the secrets, the 'INGRESS-NGINX' resource is required and can be installed by refering to this documentation: https://kubernetes.github.io/ingress-nginx/deploy/

The ingress has been configured to use app.dev domain name as the host, add this host to your local machine for ingress to route your request to the relevant service.

All the services are dockerized but you need to install Tilt on your local machine, once installed just head to the app folder and start the cluster with the command 'tilt up'. Head to http://localhost:10350/ to access the services dashboard.

## Services

### Auth Service

- **Directory**: `./auth`
- **Description**: Handles user authentication and authorization.
- **Technologies**: Node.js, Express, MongoDB, Mongoose
- **Endpoints**:
  - `POST /api/users/signup`: Register a new user
  - `POST /api/users/signin`: Log in a user
  - `POST /api/users/signout`: Log out a user
  - `GET /api/users/currentuser`: Get the current logged-in user

### Product Service

- **Directory**: `./product`
- **Description**: Manages product information.
- **Technologies**: Node.js, Express, MongoDB, Mongoose
- **Endpoints**:
  - `POST /api/products`: Create a new product
  - `GET /api/products`: Get a list of products
  - `GET /api/products/:id`: Get a specific product
  - `PUT /api/products/:id`: Update a product

### Order Service

- **Directory**: `./order`
- **Description**: Manages orders.
- **Technologies**: Node.js, Express, MongoDB, Mongoose
- **Endpoints**:
  - `POST /api/orders`: Create a new order
  - `GET /api/orders`: Get a list of orders
  - `GET /api/orders/:id`: Get a specific order
  - `DELETE /api/orders/:id`: Cancel an order

### Payment Service

- **Directory**: `./payment`
- **Description**: Handles payment processing.
- **Technologies**: Node.js, Express, MongoDB, Mongoose, Stripe
- **Endpoints**:
  - `POST /api/payments`: Create a new payment

### Expiration Service

- **Directory**: `./expiration`
- **Description**: Handles expiration of orders.
- **Technologies**: Node.js, Express, Redis
- **Endpoints**: N/A (background service)

Nats Test holds all the event bus implementation and the Nats wrapper is then used to initailise the publishers and listeners in individual services. The event specs however are defined in the common module which is imported as an npm package in required services. The error handlers and auth validation is also handled in the common module.

## Happy Coding :)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abhiabrol19/k8scommerce.git
   cd k8scommerce
   ```
