'use strict';

module.exports = function(grunt) {
    // Project configuration.
    var gruntConf = {
        watch: {
            options: {
                nospawn: true
            },
            default: {
                files: ['./**/*.coffee'],
                tasks: ['coffee', 'browserify']
            }
        },
        coffee: {
            default: {
                expand: true,
                cwd: 'dev/coffee',
                src: ['**/*.coffee'],
                dest: 'js',
                ext: '.js',
                options: {
                    bare: true
                }
            }
        },
        concurrent: {
            server: {
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        browserify: {
            dist: {
                files: {
                    './dist/gcm.js': ['js/main.js']
                }
            }
        },
        uglify: {
            my_target: {
                files: {
                    './js/main.min.js': ['./js/main-bundle.js']
                }
            }
        },
        harp: {
            server: {
                server: true
            }
        },

        taskDefault: ['coffee', 'browserify', 'harp'],
    };

    grunt.initConfig(gruntConf);

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-harp');
    grunt.registerTask('default', gruntConf.taskDefault);
};