import fs from 'fs';
import url from 'url';
import gulp from 'gulp';
import http from 'http';
import sass from 'gulp-sass';
import minifyCSS from 'gulp-minify-css';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import del from 'del';
import plumber from 'gulp-plumber';
import pump from 'pump';
import rev from 'gulp-rev';
import revCollector from 'gulp-rev-collector';
import browserSync from 'browser-sync';
import changed from 'gulp-changed';
import cache from 'gulp-cache';
import imagemin from 'gulp-imagemin';
import Mock from 'mockjs';
import proxyMiddleware from 'http-proxy-middleware';
import autoprefixer from 'gulp-autoprefixer';
import fileInclude from 'gulp-file-include';
import Q from '../lib/Q.js';
import formidable from "formidable";
import path from 'path';

//导入dev模式路径
import {
    oDevPath,
    oDesPath,
    project
} from './path';
//基本配置
import setting from './setting';

// 文件上传功能
function process_upload_file(req, res, callback) {
    let form = new formidable.IncomingForm();
    form.uploadDir = "upload";
    form.maxFieldsSize = 2 * 1024 * 1024 * 1024; //2G
    form.parse(req, function (err, fields, files) {
        let upfile;
        Object.forEach(files, function (key, file) {
            upfile = file;
        });
        callback && callback(form, upfile, fields);
    });
}

function finish_upload(req, res, fields) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    let result = {
        code: "200",
        msg: "这是消息",
        time: Date.now(),
        type: req["type"],
        data: {
            account:"1.1.1.1"
        },
        name: fields["name"]
    };
    console.log(JSON.stringify(result))
    res.write(JSON.stringify(result).toString());
    res.end();
}

//清除所有文件
const clean = () => del([oDesPath.root]);

//解析sass文件
const css = () => gulp.src(oDevPath.css)
    .pipe(changed(oDesPath.css))
    // .pipe(changed(oDesPath.css, { // dest 参数需要和 gulp.dest 中的参数保持一致
    //     extension: '.css' // 如果源文件和生成文件的后缀不同，这一行不能忘
    // }))
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
        browsers: ['last 4 versions'],
        cascade: false
    }))
    .pipe(gulp.dest(oDesPath.css))
    .pipe(browserSync.reload({
        stream: true
    }));

//图片处理
const img = () => gulp.src(oDevPath.img)
    .pipe(changed(oDesPath.img))
    .pipe(cache(imagemin({
        interlaced: false
    })))
    .pipe(gulp.dest(oDesPath.img))
    .pipe(browserSync.reload({
        stream: true
    }));

//解析js文件
const js = () => gulp.src(oDevPath.js)
    .pipe(changed(oDesPath.js))
    .pipe(plumber())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest(oDesPath.js))
    .pipe(browserSync.reload({
        stream: true
    }));

//解析配置config文件
const config = () => gulp.src(oDevPath.config)
    .pipe(changed(oDesPath.config))
    .pipe(plumber())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest(oDesPath.config))
    .pipe(browserSync.reload({
        stream: true
    }));

//处理html文件
const html = () => gulp.src(oDevPath.html)
    //.pipe(changed(oDesPath.html))
    .pipe(plumber())
    .pipe(fileInclude({
        prefix: '@@',
        basepath: '@file',
        context: {
            method: "dev"
        }
    }))
    .pipe(gulp.dest(oDesPath.html))
    .pipe(browserSync.reload({
        stream: true
    }));

//处理公共文件
const common = () => gulp.src(oDevPath.common)
    .pipe(gulp.dest(oDesPath.common))

//本地服务
const server = () => browserSync.init({
    server: {
        baseDir: oDesPath.path,
        index : project+'/index.html'
    },
    middleware(request, response, next) {
        var pathname = url.parse(request.url).pathname;
        if (pathname.indexOf("shtml") >= 0) {
            fs.readFile('./api/' + pathname, function (err, data) {
                if (err) {
                    return console.error(err);
                }
                response.writeHead(200, {
                    "Content-Type": "text/plain"
                });
                response.write(data.toString());
                response.end();
            });
        } else if (pathname.indexOf("upload") >= 0) {
            response.setHeader('Access-Control-Allow-Origin', '*');
            if (request.method == 'OPTIONS') {
                response.send('1');
                return;
            }
            let action = request["action"],
                hash = request["hash"];

            if (!hash) {
                process_upload_file(request, response, function (form, file, fields) {
                    var fileName = fields["fileName"],
                        savePath = form.uploadDir + "/" + (fileName || file.name),
                        dir = path.dirname(savePath);

                    if (dir && dir != '.') Q.mkdir(dir);

                    fs.renameSync(file.path, savePath);

                    finish_upload(request, response, fields);
                });
            } else {
                var path_tmp = "upload/" + hash,
                    path_ok = path_tmp + ".ok";

                if (action == "query") {
                    if (fs.existsSync(path_ok)) response.send('ok'); //秒传成功可以返回json对象 eg:{ ret:1, test:"aaa" }
                    else if (fs.existsSync(path_tmp)) response.send(fs.statSync(path_tmp).size + ""); //等同于 { ret:0,start:fs.statSync(path_tmp).size }
                    else response.send("0"); //等同于 { ret:0,start:0 }
                } else {
                    process_upload_file(request, response, function (form, file, fields) {
                        if (fields["retry"] != "1") fs.appendFileSync(path_tmp, fs.readFileSync(file.path));
                        fs.unlinkSync(file.path);

                        var isOk = request.query["ok"] == "1";
                        if (!isOk) {
                            response.send(fields["retry"] == "1" ? "0" : "1");
                        } else {
                            fs.renameSync(path_tmp, path_ok);
                            finish_upload(request, response, fields);
                        }
                    });
                }
            }
        } else {
            next();
        }
    }
})

// 代理服务
// const proxyConfig = proxyMiddleware('/**/*.htm', {target: 'https://www.weihudashi.com', changeOrigin: true});
// const serverProxy = () => browserSync.init({
//     port : 80,
//     server : {
//         baseDir : oDesPath.root,
//         index : 'index.html',
//         middleware : [proxyConfig]
//     }
// })


const watchLog = (event) => {
    console.log('File changed:' + event);
}

//监测文件变化
const watch = () => {
    gulp.watch(oDevPath.css, css).on('change', watchLog);
    gulp.watch(oDevPath.img, img).on('change', watchLog);
    gulp.watch(oDevPath.js, js).on('change', watchLog);
    gulp.watch(oDevPath.html, html).on('change', watchLog);
    gulp.watch(oDevPath.common, common).on('change', watchLog);
    gulp.watch(oDevPath.config, config).on('change', watchLog);
    gulp.watch(oDevPath.root + "**/*.htm", html).on('change', watchLog);
}

const dev = gulp.series(
    clean,
    gulp.parallel(css, js, config, img, html, common),
    gulp.parallel(server, watch)
);

module.exports = {
    dev : dev,
    //proxy : proxy
};

// 代理功能,后端协调后使用
// const proxy = gulp.series(
//     clean, 
//     gulp.parallel(css, js, img, html, publicFile), 
//     gulp.parallel(serverProxy, watch)
// );