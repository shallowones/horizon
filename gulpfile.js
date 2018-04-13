const gulp = require('gulp')
const del = require('del')
const browserSync = require('browser-sync')
const notify = require('gulp-notify')
const less = require('gulp-less')
const plumber = require('gulp-plumber')
const pug = require('gulp-pug')
const imageMin = require('gulp-imagemin')
const addSrc = require('gulp-add-src')
const concat = require('gulp-concat')
const gulpIf = require('gulp-if')
const rev = require('gulp-rev')
const revReplace = require('gulp-rev-replace')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const stream = require('stream-combiner2')
const cssNaNo = require('gulp-cssnano')
const LessAutoPrefix = require('less-plugin-autoprefix')
const rename = require('gulp-rename')
const packageJson = require('./package.json')
const combine = stream.obj

// запуск к продакшену, директория dist
const PROD = 'production'
// разработка, директория build
const DEV = 'development'

const isProduction = process.env.NODE_ENV === PROD

const folder = isProduction
  ? 'dist'
  : 'build'

const manifestArguments = {
  path: `./${folder}/manifest.json`,
  base: `./${folder}`,
  merge: true
}

const plumberArguments = {
  errorHandler: notify.onError()
}

const manifest = () => combine(rev.manifest(manifestArguments), gulp.dest(`./${folder}`))

const clean = () => del(`./${folder}`)

const images = () => gulp.src('./src/images/**/*.{jpg,png,svg,gif}')
  .pipe(gulpIf(isProduction, imageMin({
    svgoPlugins: [{
      convertPathData: false
    }]
  })))
  .pipe(gulp.dest(`./${folder}/images`))

const fonts = () => gulp.src('./src/fonts/**/*')
  .pipe(gulp.dest(`./${folder}/fonts`))

const views = () => gulp.src([
  './src/views/*.pug',
  '!./src/views/layout.pug'
])
  .pipe(plumber(plumberArguments))
  .pipe(pug({
    pretty: true,
    data: {}
  }))
  .pipe(gulpIf(isProduction, revReplace({
    manifest: gulp.src(`./${folder}/manifest.json`, {allowEmpty: true})
  })))
  .pipe(gulp.dest(`./${folder}`))

const styles = () => {
  const autoPrefixPlugin = new LessAutoPrefix({
    browsers: (isProduction)
      ? packageJson.browserslist[PROD]
      : packageJson.browserslist[DEV]
  })

  return gulp.src('./src/styles/*.less')
    .pipe(plumber(plumberArguments))
    .pipe(less({
      paths: ['node_modules'],
      plugins: [autoPrefixPlugin]
    }))
    .pipe(addSrc.prepend('./node_modules/normalize.css/normalize.css'))
    .pipe(concat('main.css'))
    .pipe(gulpIf(isProduction, rev()))
    .pipe(gulp.dest(`./${folder}/css`))
    .pipe(gulpIf(isProduction, manifest()))
}

const scripts = () => gulp.src('./src/js/**/*.js')
  .pipe(gulpIf(isProduction, combine(babel({presets: ['es2015']}), uglify(), rev())))
  .pipe(gulp.dest(`./${folder}/js/app`))
  .pipe(gulpIf(isProduction, manifest()))

const vendorScripts = [
  function jquery () {
    return gulp.src('./node_modules/jquery/dist/jquery.min.js')
      .pipe(gulp.dest(`./${folder}/js/vendor/jquery`))
  },
  function scrollMagic () {
    const files = [
      './node_modules/gsap/TweenMax.js',
      './node_modules/scrollmagic/scrollmagic/uncompressed/ScrollMagic.js',
      './node_modules/scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'
    ]

    if (!isProduction) {
      files.push('./node_modules/scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js')
    }

    return gulp.src(files)
      .pipe(concat('scrollmagic.min.js'))
      .pipe(gulpIf(isProduction, uglify()))
      .pipe(gulp.dest(`./${folder}/js/vendor/scrollmagic`))
  },
  function sumoSelectJS () {
    return gulp.src('./node_modules/sumoselect/jquery.sumoselect.min.js')
      .pipe(gulp.dest(`./${folder}/js/vendor/sumoselect`))
  },
  function sumoSelectCSS () {
    return gulp.src('./node_modules/sumoselect/sumoselect.min.css')
      .pipe(gulp.dest(`./${folder}/js/vendor/sumoselect`))
  },
  function swiperJS () {
    return gulp.src('./node_modules/swiper/dist/js/swiper.min.js')
      .pipe(gulp.dest(`./${folder}/js/vendor/swiper`))
  },
  function swiperCSS () {
    return gulp.src('./node_modules/swiper/dist/css/swiper.min.css')
      .pipe(gulp.dest(`./${folder}/js/vendor/swiper`))
  },
  function jBoxJS () {
    return gulp.src('./node_modules/jbox/Source/jbox.min.js')
      .pipe(gulp.dest(`./${folder}/js/vendor/jbox`))
  },
  function jBoxCSS () {
    return gulp.src('./node_modules/jbox/Source/jbox.css')
      .pipe(cssNaNo())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(`./${folder}/js/vendor/jbox`))
  },
  function fancyBoxJS () {
    return gulp.src('./node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js')
      .pipe(gulp.dest(`./${folder}/js/vendor/fancybox`))
  },
  function fancyBoxCSS () {
    return gulp.src('./node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css')
      .pipe(gulp.dest(`./${folder}/js/vendor/fancybox`))
  }
]

const watch = () => {
  gulp.watch('./src/views/**/*.pug', views)
  gulp.watch('./src/styles/*.less', styles)
  gulp.watch('./src/images/**/*.{jpg,jpeg,png,svg,gif}', images)
  gulp.watch('./src/js/*.js', scripts)
}

const serve = () => {
  browserSync.init({
    server: './build'
  })
  browserSync
    .watch('./build/**/*.*')
    .on('change', browserSync.reload)
}

gulp.task('default', gulp.series(
  clean,
  gulp.series(styles, scripts, ...vendorScripts),
  gulp.parallel(views, fonts, images),
  gulpIf(!isProduction, gulp.parallel(serve, watch), (cb) => cb())
))
