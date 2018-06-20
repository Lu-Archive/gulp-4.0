const project="client";

//定义根路径
let sDevRoot="src/";
let sDesRoot="dist/";
let sBuildRoot="build/";

//开发环境路径
const oDevPath={
	root : sDevRoot,
	css  : sDevRoot+project+"/css/**/*.+(css|scss)",
	js   : sDevRoot+project+"/js/**/*.js",
	img  : sDevRoot+project+"/img/**/*.+(png|jpg|gif|svg)",
	font : sDevRoot+project+"/**/*.+(ttf|woff)",
	html : sDevRoot+project+"/**/*.html",
	common:sDevRoot+"/common/**/*",
	config:sDevRoot+"/config/**/*",
}
//输出路径
const oDesPath={
	path : sDesRoot,
	root : sDesRoot+project,
	css  : sDesRoot+project+"/css/",
	js   : sDesRoot+project+"/js/",
	img  : sDesRoot+project+"/img/",
	font : sDesRoot+project+"/",
	html : sDesRoot+project+"/",
	common:sDesRoot+"/common/",
	config:sDesRoot+"/config/",
}

//预览路径
const oBuildPath={
	root : sBuildRoot,
	css  : sBuildRoot+project+"/css/",
	js   : sBuildRoot+project+"/js/",
	img  : sBuildRoot+project+"/img/",
	font : sBuildRoot+project+"/",
	html : sBuildRoot+project+"/",
	rev : sBuildRoot+project+"/rev/",
	common:sBuildRoot+"/common/",
	config:sBuildRoot+"/config/",
}

module.exports={
	oDevPath,
	oDesPath,
	oBuildPath,
	project
}