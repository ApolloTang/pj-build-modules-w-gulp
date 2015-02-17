'use strict';

var fs = require('fs');
var path = require('path');
var hbs = require('handlebars');
var Promise = require('bluebird');
var watch = require('watch');
var less = require('less');

var modName;

task('watch', function (_modName) {
    modName = _modName;
    var buildTask = jake.Task['build'];
    buildTask.invoke();

    watch.watchTree(path.resolve(process.cwd(), 'modules/' + modName), function (f, curr, prev) {
        buildTask.invoke();
    });
});


task('build', function (_modName) {
    if (_modName) {
        modName = _modName;
    }
    jake.mkdirP('.build');
    
    var tplSrc = fs.readFileSync('./misc/markup.hbs').toString();
    var tpl = hbs.compile(tplSrc);
    
    compileModule(modName, true).then(function (data) {
        var result = tpl(data);
        fs.writeFileSync(path.resolve('.build/index.html'), result);
    }).finally(complete);

}, {async: true});

function getMarkup (modName) {
    var filePath = path.resolve('./modules/' + modName + '/index.html');
    return fs.readFileSync(filePath).toString();
}

function getScript (modName) {
    var filePath = path.resolve('./modules/' + modName + '/index.js');
    var script = fs.readFileSync(filePath).toString();
    return script;
}

function getStyle(modName, withFramework) {
    var filePath = path.resolve('./modules/' + modName + '/index.less');
    var style = fs.readFileSync(filePath).toString();

    if (!withFramework) {
        return {css: style};
    }
    
    return injectLibStyle(style);
}


function injectLibStyle(style) {
    var mainLess = fs.readFileSync('./misc/style.hbs').toString();
    var mainTpl = hbs.compile(mainLess);
    var main = mainTpl({content: style});

    jake.cpR(path.resolve(process.cwd(), './style/libs/font-awesome-4.3.0/fonts'), '.build');

    return less.render(main, {paths: [
        path.resolve(process.cwd(), './style/libs/bootstrap-less'),
        path.resolve(process.cwd(), './style/libs/font-awesome-4.3.0/less'),
    ]});
}



task('build-all', function () {
   
    var modules = fs.readdirSync('./modules');
    
    var tplSrc = fs.readFileSync('./misc/index.hbs').toString();
    var tpl = hbs.compile(tplSrc);
    
    Promise.all(modules.map(compileModule)).then(function (moduleData) {
        return injectLibStyle(moduleData.map(function (m) {
            return m.style;
        }).join('\n')).then(function (style) {
            return [style, moduleData];
        });
    }).spread(function (style, moduleData) {
        var html = tpl({style: style.css, modules: moduleData});
        fs.writeFileSync(path.resolve('.build/index.html'), html);
    }).catch(function () {
        console.log(arguments);
    });
});


function compileModule(modName, withFramework) {
    return Promise.all([getMarkup(modName), getScript(modName), getStyle(modName, withFramework)]).spread(function (content, script, style) {
        var data = {
            content: content,
            script: script,
            style: style.css
        };
        return data;
    });
}