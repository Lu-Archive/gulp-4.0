// const gulp = require('gulp');
// const http = require("http");
// const url = require("url");
// const changed = require("gulp-changed");
// const browserSync = require('browser-sync')
// const sass = require('gulp-sass');
// const minifyCSS = require('gulp-minify-css');
// const imagemin = require('gulp-imagemin');
// const htmlmin = require('gulp-htmlmin');
// const cache = require('gulp-cache');
// const del = require('del');
// const sourcemaps = require('gulp-sourcemaps');
// const babel = require('gulp-babel');
// const uglify = require('gulp-uglify-es').default;
// const pump = require('pump');
// const runSequence = require('run-sequence');
// const fileInclude = require('gulp-file-include');
// const fs = require("fs");
// const rename = require('gulp-rename');
// const plumber = require('gulp-plumber');
// const autoprefixer = require('gulp-autoprefixer');
// const rev = require('gulp-rev');
// const revCollector = require('gulp-rev-collector');
// const Q = require('./lib/Q.js');
// const formidable = require("formidable");
// const path = require('path');

// function process_upload_file(req, res, callback) {
// 	var form = new formidable.IncomingForm();

// 	form.uploadDir = "upload";
// 	form.maxFieldsSize = 2 * 1024 * 1024 * 1024; //2G

// 	form.parse(req, function (err, fields, files) {
// 		var upfile;

// 		Object.forEach(files, function (key, file) {
// 			upfile = file;
// 		});

// 		callback && callback(form, upfile, fields);
// 	});
// }

// function finish_upload(req, res, fields) {
// 	res.writeHead(200, {
// 		"Content-Type": "text/plain"
// 	});
	
// 	var result = {
// 		code:"200",
// 		msg:"这是消息",
// 		time: Date.now(),
// 		type: req["type"],
// 		user: fields["user"],
// 		name: fields["name"]
// 	};
// 	console.log(JSON.stringify(result))
// 	res.write(JSON.stringify(result).toString());
// 	res.end();
// }


// //基本配置
// const setting = require('./config/setting');

// //获取输入输出地址
// const {
// 	oDevPath,
// 	oDesPath,
// 	oBuildPath,
// 	project
// } = require('./config/path');

// gulp.task('dev', function (callback) { //输出项目
// 	runSequence('clean', ['css', 'js', 'config', 'img', 'html', 'common', 'font'], 'watch', callback)
// })



// //task:build
// gulp.task('build', function (callback) { //输出项目
// 	runSequence('clean_build', ['css_build', 'js_build', 'config_build', 'img_build', 'font_build', 'html_build', 'common_build'], 'revHtml_build', 'watch_build', callback)
// })

// gulp.task('watch', ['css', 'js', 'config', 'img', 'html', 'font', 'common', 'browserSync'], function () {
// 	gulp.watch(oDevPath.css, ['css'])
// 	gulp.watch(oDevPath.js, ['js'])
// 	gulp.watch(oDevPath.html, ['html'])
// 	gulp.watch(oDevPath.img, ['img'])
// 	gulp.watch(oDevPath.common, ['common'])
// 	gulp.watch(oDevPath.config, ['config'])
// 	gulp.watch(oDevPath.root + "**/*.htm", ['html'])
// })

// gulp.task('watch_build', ['css_build', 'js_build', 'config_build', 'img_build', 'html_build', 'font', 'common_build'], function () {
// 	gulp.watch(oDevPath.css, ['css_build', 'revHtml_build'])
// 	gulp.watch(oDevPath.js, ['js_build', 'revHtml_build'])
// 	gulp.watch(oDevPath.html, ['html_build'])
// 	gulp.watch(oDevPath.img, ['img_build'])
// 	gulp.watch(oDevPath.common, ['common_build'])
// 	gulp.watch(oDevPath.config, ['config_build'])
// 	gulp.watch(oDevPath.root + "**/*.htm", ['html_build'])
// })

// //task:common
// gulp.task('common', function () { //删除整个输出文件夹
// 	return gulp.src(oDevPath.common)
// 		.pipe(gulp.dest(oDesPath.common))
// })

// //task:common
// gulp.task('common_build', function () { //删除整个输出文件夹
// 	return gulp.src(oDevPath.common)
// 		.pipe(gulp.dest(oBuildPath.common))
// })

// //task:clean
// gulp.task('clean', function () { //删除整个输出文件夹
// 	return del(oDesPath.root, {
// 		force: true
// 	});
// })
// //task:clean
// gulp.task('clean_build', function () { //删除整个输出文件夹
// 	return del(["../webapp/accel", "../webapp/common"], {
// 		force: true
// 	});
// })

// gulp.task('browserSync', function () { //建立服务器地址
// 	browserSync({
// 		server: {
// 			baseDir: oDesPath.path
// 		},
// 		startPath: "/" + project + '/index.html',
// 		middleware: function (request, response, next) {
// 			var pathname = url.parse(request.url).pathname;
// 			if (pathname.indexOf("shtml") >= 0) {
// 				fs.readFile('./api/' + pathname, function (err, data) {
// 					if (err) {
// 						return console.error(err);
// 					}
// 					response.writeHead(200, {
// 						"Content-Type": "text/plain"
// 					});
// 					response.write(data.toString());
// 					response.end();
// 				});
// 			} else if (pathname.indexOf("upload") >= 0) {
// 				response.setHeader('Access-Control-Allow-Origin', '*');
// 				if (request.method == 'OPTIONS') {
// 					response.send('1');
// 					return;
// 				}
// 				let action = request["action"],
// 					hash = request["hash"];

// 				if (!hash) {
// 					process_upload_file(request, response, function (form, file, fields) {
// 						var fileName = fields["fileName"],
// 							savePath = form.uploadDir + "/" + (fileName || file.name),
// 							dir = path.dirname(savePath);

// 						if (dir && dir != '.') Q.mkdir(dir);

// 						fs.renameSync(file.path, savePath);

// 						finish_upload(request, response, fields);
// 					});
// 				} else {
// 					var path_tmp = "upload/" + hash,
// 						path_ok = path_tmp + ".ok";

// 					if (action == "query") {
// 						if (fs.existsSync(path_ok)) response.send('ok'); //秒传成功可以返回json对象 eg:{ ret:1, test:"aaa" }
// 						else if (fs.existsSync(path_tmp)) response.send(fs.statSync(path_tmp).size + ""); //等同于 { ret:0,start:fs.statSync(path_tmp).size }
// 						else response.send("0"); //等同于 { ret:0,start:0 }
// 					} else {
// 						process_upload_file(request, response, function (form, file, fields) {
// 							if (fields["retry"] != "1") fs.appendFileSync(path_tmp, fs.readFileSync(file.path));
// 							fs.unlinkSync(file.path);

// 							var isOk = request.query["ok"] == "1";
// 							if (!isOk) {
// 								response.send(fields["retry"] == "1" ? "0" : "1");
// 							} else {
// 								fs.renameSync(path_tmp, path_ok);
// 								finish_upload(request, response, fields);
// 							}
// 						});
// 					}
// 				}
// 			} else {
// 				next();
// 			}
// 		}
// 	})
// })

// // css
// gulp.task('css', function () { //sass编译
// 	return gulp.src(oDevPath.css)
// 		.pipe(changed(oDesPath.css))
// 		.pipe(plumber())
// 		.pipe(sourcemaps.init())
// 		.pipe(sass().on('error', sass.logError))
// 		.pipe(sourcemaps.write())
// 		.pipe(autoprefixer({
// 			browsers: ['last 4 versions'],
// 			cascade: false
// 		}))
// 		.pipe(gulp.dest(oDesPath.css))
// 		.pipe(browserSync.reload({
// 			stream: true
// 		}))
// })

// //img
// gulp.task('img', function () {
// 	return gulp.src(oDevPath.img)
// 		.pipe(changed(oDesPath.img))
// 		.pipe(cache(imagemin({
// 			interlaced: true
// 		})))
// 		.pipe(gulp.dest(oDesPath.img))
// 		.pipe(browserSync.reload({
// 			stream: true
// 		}))
// })

// //font
// gulp.task('font', function () {
// 	return gulp.src(oDevPath.font)
// 		.pipe(changed(oDesPath.font))
// 		.pipe(gulp.dest(oDesPath.font))
// 		.pipe(browserSync.reload({
// 			stream: true
// 		}))
// })

// //js
// gulp.task('js', function () { //js输出
// 	return gulp.src(oDevPath.js)
// 		.pipe(changed(oDesPath.js))
// 		.pipe(plumber())
// 		.pipe(babel({
// 			presets: ['es2015']
// 		}))
// 		.pipe(gulp.dest(oDesPath.js))
// 		.pipe(browserSync.reload({
// 			stream: true
// 		}))
// })
// //js
// gulp.task('config', function () { //js输出
// 	return gulp.src(oDevPath.config)
// 		.pipe(changed(oDesPath.config))
// 		.pipe(plumber())
// 		.pipe(babel({
// 			presets: ['es2015']
// 		}))
// 		.pipe(gulp.dest(oDesPath.config))
// 		.pipe(browserSync.reload({
// 			stream: true
// 		}))
// })

// //html
// gulp.task('html', function () {
// 	return gulp.src(oDevPath.html)
// 		//.pipe(changed(oDesPath.html))
// 		.pipe(plumber())
// 		.pipe(fileInclude({
// 			prefix: '@@',
// 			basepath: '@file',
// 			context: {
// 				method: "dev",
// 				version: setting.version
// 			}
// 		}))
// 		.pipe(gulp.dest(oDesPath.html))
// 		.pipe(browserSync.reload({
// 			stream: true
// 		}))
// })

// //---------------------生产版本
// // css_build
// gulp.task('css_build', function () { //sass编译
// 	return gulp.src(oDevPath.css)
// 		.pipe(changed(oBuildPath.css))
// 		.pipe(rev())
// 		.pipe(sourcemaps.init())
// 		.pipe(sass().on('error', sass.logError))
// 		.pipe(sourcemaps.write())
// 		.pipe(autoprefixer({
// 			browsers: ['last 4 versions'],
// 			cascade: false
// 		}))
// 		.pipe(minifyCSS())
// 		.pipe(gulp.dest(oBuildPath.css))
// 		.pipe(rev.manifest()) //set hash key json
// 		.pipe(gulp.dest(oBuildPath.rev + "css"));
// })
// //img_build
// gulp.task('img_build', function () {
// 	return gulp.src(oDevPath.img)
// 		// .pipe(cache(imagemin({
// 		// 	interlaced:true
// 		// })))
// 		.pipe(gulp.dest(oBuildPath.img))
// })

// //font_build
// gulp.task('font_build', function () {
// 	return gulp.src(oDevPath.font)
// 		.pipe(changed(oBuildPath.font))
// 		.pipe(gulp.dest(oBuildPath.font))
// })

// //js_build
// gulp.task('js_build', function () { //js输出
// 	return gulp.src(oDevPath.js)
// 		.pipe(changed(oBuildPath.js))
// 		.pipe(rev())
// 		//.pipe(sourcemaps.write())
// 		.pipe(babel({
// 			presets: ['es2015']
// 		}))
// 		.pipe(uglify()) //js压缩
// 		.pipe(gulp.dest(oBuildPath.js))
// 		.pipe(rev.manifest()) //set hash key json
// 		.pipe(gulp.dest(oBuildPath.rev + "js"));
// })

// //config_build
// gulp.task('config_build', function () { //config输出
// 	return gulp.src(oDevPath.config)
// 		.pipe(changed(oBuildPath.config))
// 		//.pipe(sourcemaps.write())
// 		.pipe(babel({
// 			presets: ['es2015']
// 		}))
// 		.pipe(uglify()) //config压缩
// 		.pipe(gulp.dest(oBuildPath.config))
// })

// //html_build
// gulp.task('html_build', function () {
// 	let options = {
// 		removeComments: true, //清除HTML注释
// 		collapseWhitespace: true, //压缩HTML
// 		collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
// 		removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
// 		removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
// 		removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
// 		minifyJS: true, //压缩页面JS
// 		minifyCSS: true //压缩页面CSS
// 	};
// 	return gulp.src(oDevPath.html)
// 		.pipe(changed(oBuildPath.html))
// 		.pipe(fileInclude({
// 			prefix: '@@',
// 			basepath: '@file',
// 			context: {
// 				method: "build",
// 				version: setting.version
// 			}
// 		}))
// 		.pipe(htmlmin(options))
// 		.pipe(gulp.dest(oBuildPath.html));
// })

// gulp.task("revHtml_build", function () {
// 	return gulp.src([oBuildPath.rev + "**/*.json", oBuildPath.html + "/**/*"])
// 		.pipe(revCollector({
// 			replaceReved: true
// 		}))
// 		.pipe(gulp.dest(oBuildPath.html))
// })