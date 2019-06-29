module.exports = {
    jHTML2CanvasScript: {
        files: ['<%= dir %>src/**/*.js'],
        tasks: ['clean:jDist',
            'concat:jCore',
            'uglify:jSlider',
            'copy:copycss'
        ]
    },
};