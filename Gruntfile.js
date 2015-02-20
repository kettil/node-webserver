'use strict';
module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files:   [
                '**/*.js',
                '!node_modules/**/*.js',
                '!log/**/*.js',
                '!test/**/*.js',
                '!html/assets/bower/**/*.js',
                '!html/public/js/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            scripts: {
                files:   [
                    '**/*.js',
                    '!node_modules/**/*.js',
                    '!html/public/js/**/*.js'
                ],
                tasks:   [ 'default' ],
                options: {
                    interrupt: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [ 'jshint' ]);

};
