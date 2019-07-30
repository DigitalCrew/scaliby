# Scaliby - Web Front-end Framework 

## Introduction
**Scaliby** is an open source Web Front-end framework. Oh! Another framework? My goodness!

It's ok. Calm down! Let's understand the motivation.

When we develop an application we need to focus the "energy" of brain to create the best business rules, because the 
goal of software is to be the best and make the user happy. But if we waste time on user interface that is complex to 
understand and integrate into the system, software quality may be degraded.

If the framework is easy to use and powerful, we can achieve the goal.

**Scaliby**'s purpose is to be easy to develop and has features that offer a functional user interface.

## Under The Hood
**Scaliby** isn't a revolution, doesn't use new technologies or presents a new paradigm. It uses good programming 
practices.

**Scaliby** is based on **Material Design** ([https://material.io](https://material.io)). In addition, there isn't new 
language or changed syntax. It uses what already exists: **HTML**, **CSS** and **Javascript**. To use this framework, 
the starting point is the elements of **HTML**. Since there isn't new language or preprocessing, the trick is to use two 
features:
* **CSS** classes to identify the components;
* **"data-"** attributes that expands the elements configuration.

## Quick Start
Run these commands to set up the project:
* Clone the repo: `git clone https://github.com/DigitalCrew/scaliby.git`
* Install the modules: `npm install --save-dev gulp gulp-babel gulp-plumber gulp-concat gulp-uglify gulp-webserver gulp-clean-css @babel/core @babel/preset-env @babel/plugin-proposal-class-properties` 

Commands:
* `npm run build-dev` - Builds the package file without minification for development purposes; 
* `npm run build-prod` - Builds the package for production environment;
* `npm run watch` - Starts a test web server and also updates the package when the source files are changed. It opens 
the page [http://localhost:8000/](http://localhost:8000/)


## Documentation
Coming soon. 

For a while, uses the page [http://localhost:8000/](http://localhost:8000/) after running the command `npm run watch`