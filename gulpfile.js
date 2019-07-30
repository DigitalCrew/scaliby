/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//Dependencies
const { src, dest, series, parallel } = require('gulp');
const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const webServer = require("gulp-webserver");
const fileSystem = require("fs");


//Constants
const version = getVersion();
const srcDirectory = "./src";

const jsDistDirectory = "./dist/js";
const jsScalibySrc = ["./src/js/**/*.js"];
const jsThirdpartySrc = ["./third-party/js/jquery-*.min.js",
	"./third-party/js/datatables-*.min.js",
	"./third-party/js/material-components-web-*.min.js",
	"./third-party/js/duDatepicker.js",
	"./third-party/js/mdtimepicker.js"];
const jsBundleScaliby = "scaliby-only.js";
const jsBundleAll = "scaliby-" + version + ".min.js";

const cssDistDirectory = "./dist/css";
const cssScalibySrc = ["./src/css/**/*.css"];
const cssThirdpartySrc = ["./third-party/css/*.css"];
const cssBundleScaliby = "scaliby-only.css";
const cssBundleAll = "scaliby-" + version + ".min.css";

//Verifies the environment
let env = "dev";
if (process.argv.length === 4) {
	env = process.argv[3].substring(2);
}

/**
 * Gets the version from the "VERSION.txt" file.
 *
 * @return {string} the version.
 */
function getVersion() {
	let content = fileSystem.readFileSync("VERSION.txt").toString();
	return content.replace(/(\r\n|\n|\r)/gm,"");
}

/**
 * Builds the Javascript source of Scaliby.
 */
function buildScalibyJs(done) {
	if (env === "dev") {
		return src(jsScalibySrc)
			.pipe(plumber())
			.pipe(concat(jsBundleScaliby))
			.pipe(babel())
			.pipe(dest(jsDistDirectory))
	} else {
		return src(jsScalibySrc)
			.pipe(plumber())
			.pipe(concat(jsBundleScaliby))
			.pipe(babel())
			.pipe(uglify())
			.pipe(dest(jsDistDirectory))
	}
}

/**
 * Builds the Javascript with Scaliby and third-parties.
 */
function buildAllJs(done) {
	return src([...jsThirdpartySrc, jsDistDirectory + "/" + jsBundleScaliby])
		.pipe(plumber())
		.pipe(concat(jsBundleAll))
		.pipe(dest(jsDistDirectory))
}

/**
 * Builds the CSS source of Scaliby.
 */
function buildScalibyCss(done) {
	if (env === "dev") {
		return src(cssScalibySrc)
			.pipe(concat(cssBundleScaliby))
			.pipe(dest(cssDistDirectory))
	} else {
		return src(cssScalibySrc)
			.pipe(concat(cssBundleScaliby))
			.pipe(cleanCSS())
			.pipe(dest(cssDistDirectory))
	}
}

/**
 * Builds the CSS with Scaliby and third-parties.
 */
function buildAllCss(done) {
	return src([...cssThirdpartySrc, cssDistDirectory + "/" + cssBundleScaliby])
		.pipe(plumber())
		.pipe(concat(cssBundleAll))
		.pipe(dest(cssDistDirectory))
}

/**
 * Verifies if source file changed.
 */

function watchFiles() {
	gulp.watch(srcDirectory, series(buildScalibyJs, buildAllJs, buildScalibyCss, buildAllCss));
}

/**
 * Starts a web server for the web site.
 */
function startWebserver() {
	gulp.src("dist")
		.pipe(webServer({
			livereload: true,
			open: true,
			fallback: "dist/index.html"
		}));
}

exports.build = series(buildScalibyJs, buildAllJs, buildScalibyCss, buildAllCss);
exports.watch = series(buildScalibyJs, buildAllJs, buildScalibyCss, buildAllCss, parallel(watchFiles, startWebserver));