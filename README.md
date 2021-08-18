# Open Merchant - Open Source Ecommerce Solution

Open Merchant is an open source, self-hosted, frontend agnostic ecommerce solution.

## Setup

### Build and run project locally

#### Install all the dependencies of the project
```
npm install
```

#### Reset database
```
npm run db:reset
```

#### Reseed database
```
npm run db:reseed
```

#### Start local development server
```
npm run dev
```

## Other repositories

Open Merchant comes equipped with an admin panel and a storefront. These tools are decoupled from the backend API, giving developers the freedom to choose their own frontend framework of choice to build their own. The entire codebase is available on Github.

[openmerchant-admin](https://github.com/faizwong/openmerchant-admin): The admin panel for Open Merchant

[openmerchant-storefront](https://github.com/faizwong/openmerchant-admin): A storefront single page application that consumes the Open Merchant API

## Warning

This project is currently in active development and should not be used in production. Use it at your own risk.
