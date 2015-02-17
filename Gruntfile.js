module.exports = function(grunt) {

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // to read: http://stackoverflow.com/questions/tagged/grunt-contrib-less
        less: {
            development: {
                options: {
                    paths: ["style"]
                },
                files: {
                    "style/main.css": "style/main.less"
                }
            },
            production: {
                options: {
                    paths: ["style"],
                    cleancss: true
                },
                files: {
                    "style/main.css": "style/main.less"
                }
            }
        },

        watch: {
            styles: {
                files: ['style/**/*.less'], // which files to watch
                tasks: ['less'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    grunt.registerTask('default', ['less', 'watch']);
};
