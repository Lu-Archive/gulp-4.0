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
import proxyMiddleware from 'http-proxy-middleware';
import autoprefixer from 'gulp-autoprefixer';
import fileInclude from 'gulp-file-include';
import Q from '../lib/Q.js';
import formidable from "formidable";
import path from 'path';

//导入dev模式路径
import {
    oDevPath,
    oBuildPath,
    project
} from './path';
//基本配置
import setting from './setting';


//清除所有文件
const clean = () => del([ oBuildPath.root + project, oBuildPath.root + "common", oBuildPath.root + "config"]);

//解析sass文件
const css = () => gulp.src(oDevPath.css)
    .pipe(changed(oBuildPath.css))
    .pipe(rev())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
        browsers: ['last 4 versions'],
        cascade: false
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest(oBuildPath.css))
    .pipe(rev.manifest()) //set hash key json
    .pipe(gulp.dest(oBuildPath.rev + "css"));

//图片处理
const img = () => gulp.src(oDevPath.img)
    // .pipe(changed(oDesPath.img))
    // .pipe(cache(imagemin({
    //     interlaced: false
    // })))
    .pipe(gulp.dest(oBuildPath.img))

//解析js文件
const js = () => gulp.src(oDevPath.js)
    .pipe(changed(oBuildPath.js))
    .pipe(rev())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify()) //js压缩
    .pipe(gulp.dest(oBuildPath.js))
    .pipe(rev.manifest()) //set hash key json
    .pipe(gulp.dest(oBuildPath.rev + "js"));

//解析配置config文件
const config = () => gulp.src(oDevPath.config)
    .pipe(changed(oBuildPath.config))
    //.pipe(sourcemaps.write())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify()) //config压缩
    .pipe(gulp.dest(oBuildPath.config))

//处理html文件
let htmlOptions = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true //压缩页面CSS
};
const html = () => gulp.src(oDevPath.html)
    .pipe(changed(oBuildPath.html))
    .pipe(fileInclude({
        prefix: '@@',
        basepath: '@file',
        context: {
            method: "build",
            version: setting.version
        }
    }))
    .pipe(htmlmin(htmlOptions))
    .pipe(gulp.dest(oBuildPath.html));

//处理公共文件
const common = () => gulp.src(oDevPath.common)
    .pipe(gulp.dest(oBuildPath.common))


//处理文件hash
const revFile = () => gulp.src([oBuildPath.rev + "**/*.json", oBuildPath.html + "/**/*"])
    .pipe(revCollector({
        replaceReved: true
    }))
    .pipe(gulp.dest(oBuildPath.html))


const build = gulp.series(
    clean,
    gulp.parallel(css, js, config, img, html, common),
    gulp.parallel(revFile)
);

module.exports = {
    build: build
};