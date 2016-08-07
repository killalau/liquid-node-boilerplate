var gulp = require('gulp');
var rename = require('gulp-rename');
var watch = require('gulp-watch');

var fs = require('fs');
var path = require('path');
var through = require('through2');
var istextorbinary = require('istextorbinary');
var Liquid = require('shopify-liquid');
var liquidEngine = Liquid();

function gulpLiquid() {
    return through.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        istextorbinary.isText(file.path, file.contents, function (err, result) {
            if (err || !result) {
                return callback(err, file);
            }
            var str = String(file.contents);
            var json = {};
            try {
                json = fs.readFileSync(path.resolve(file.path + '.json'));
                json = JSON.parse(json);
            } catch (e) { }
            var html = liquidEngine.parseAndRender(str, json);
            file.contents = new Buffer(html);
            console.log(file.path);
            return callback(null, file);
        });
    });
}

function build() {
    gulp.src('./src/**/*.liquid')
        .pipe(gulpLiquid())
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest('./dist'));
}

gulp.task('default', function () {
    return build();
});

gulp.task('watch', function () {
    return watch('./src/**/*', function () {
        build();
    });
});