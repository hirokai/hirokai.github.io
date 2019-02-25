module.exports = (grunt)->
  grunt.loadNpmTasks 'grunt-assemble'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.initConfig
    assemble:
      options:
        layoutdir: 'src/layouts'
        data: ['src/data/**/*.{json,yml}']
        partials: ['src/includes/**/*.hbs']
        helpers: ['src/helpers/*.js']
        flatten: true
        dest: 'mydist'
        removeHbsWhitespace: true
        minify:
          removeAttributeQuotes: true
          collapseWhitespace: true
      site:
        files:
          '..': ['src/pages/**/*.hbs']
    watch:
      assemble:
        files: ['src/**/*.hbs','src/data/*.json','src/helpers/*.js']
        tasks: ['assemble']

  grunt.registerTask 'default', ['watch']
