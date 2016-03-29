/**
 * Created by meng on 15-11-16.
 */

module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                files: {
                    'education_app/dist/<%= pkg.name %>.min.js':['<%= concat.dist.dest %>']
                }
            }
        },
        //jshint: {
        //    files: ['education_app/js/*.js'],
        //    options: {
        //        //这里是覆盖JSHint默认配置的选项
        //        globals: {
        //            jQuery: true,
        //            console: true,
        //            module: true,
        //            document: true
        //        }
        //    }
        //},
        concat: {
            options: {
                separator: ";"
            },
            dist: {
                src:['education_app/js/*.js'],
                dest: 'education_app/dist/<%= pkg.name %>.js'
            }
        },
        watch: {
            html: {
                files: ['education_app/templates/**.html'],
                options: {livereload:true}
            },
            less: {
                files: ['education_app/less/*.less'],
                options: {livereload: true},
                tasks: ['less:main']
            },
            css: {
                files: ['education_app/**/*.css'],
                options: {livereload:true}
            },
            js: {
                files: ['education_app/**/*.js'],
                options: {livereload:true}
            }
        },
        browserSync: {
            bsFiles: {
                src : [
                    'education_app/**/*.css',
                    'education_app/**/*.html',
                    'education_app/**/*.js'
                ]
            },
            options: {
                watchTask: true,
                server:  "./education_app",
                //proxy: 'localhost:3100',
                port: 3800
                //tunnel: true
            }
        },
        less :{
            main: {
                expand: true,
                cwd: 'education_app/less/',
                src: ['**/*.less'],
                dest: 'education_app/css/',
                ext: '.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-livereload');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default',['browserSync','watch']);
    grunt.registerTask('lessc',['less:compile']);
    grunt.registerTask('release',['concat','uglify']);
};