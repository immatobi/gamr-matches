# Gamr-Matches REST API

> Node (Typescript) REST API that allows a football league manager keep records of all matches and fixtures. Get notifications before the beginning of a match and get scoreboard details.

## Framework

This Software is built with the Nodejs framework, with pure typescript as the javascript coding language.

## Usage

- Pull the [codebase](https://github.com/immatobi/gamr-matches.git) from the repository.
- Make sure to have Nodejs && Typescrit installed globally on your computer
- Duplicate the .env.example file and rename it to .env
- Supply all the .env values except the ones already supplied.

### Install dependencies
```
- Run the command --> "npm install --force"
```

### Run Application
```
- Run in development mode --> "npm run dev"
- Run in production mode --> "npm start"
```

### Common commands
```
- Empty database --> "npm run seed-d"
- Automatic test --> "npm run test"
```

### Important ENV variables
```
- MONGODB_URI : Your database connection string. Please use MongoDB
- MONGODB_TEST_URI : Your test database connection string. Use MongoDB

- REDIS_HOST: Your redis host connection string
- REDIS_PORT: Your redis PORT

```

## API Documentation
See the Application REST API documentation in the Postman link below.

[API Doc. link - Gamr-Matches](https://documenter.getpostman.com/view/5093497/UyxgHnqm)


## Metadata

Version: 1.0.0  ||  License: MIT
