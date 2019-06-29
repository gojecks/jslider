module.exports = {
    copycss: {
        src: ['core.jslider.css'],
        dest: '<%= dir %>dist/',
        cwd: '<%= dir %>src/',
        expand: true,
        filter: 'isFile'
    }
};