module.exports = function(grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        compass: {
            desktop: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'css',
                    outputStyle: 'compressed'
                }
            }
        },

        watch: {
            options: {
                livereload: true,
                atBegin: true
            },
            css: {
                files: ['scss/*.scss'],
                tasks: ['css'],
            },
            markup: {
                files: ['*.html', '*.inc', '*.php'],
                tasks: []
            },
            js: {
                files: ['js/**/*.js'],
                tasks: ['js']
            }
        },

        concat: {
            dist: {
                src: ['js/lib/**/*.js','js/vendor/**/*.js','js/main.js','js/ContentHandler.js','js/MainCategoriesHandler.js','js/SubCategoriesHandler.js', 'js/URLParameterHandler.js'],
                dest: 'js/scripts.js'
            }
        },

        uglify: {
            all: {
                files: {
                    'js/scripts.min.js': [
                        'js/scripts.js'
                    ]
                },
                options: {
                    sourceMap: false
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('css', ['compass']);
    grunt.registerTask('js', ['concat', 'uglify']);
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('install', ['css', 'js']);
};
