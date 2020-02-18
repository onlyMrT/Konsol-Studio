
/* Подключаем модули, с которыми будем работать */
let gulp = require('gulp');										/* Сам gulp */
    browserSync = require('browser-sync').create();		/* Локальный сервер при сохранении файла будет обновлять открытую в браузере страницу */
    pug = require('gulp-pug');									/* Компилирует файлы из .pug в .html */
    sass = require('gulp-sass');								/* Компиляция из Sass в CSS */
    spritesmith = require('gulp.spritesmith');			/* Плагин для работы со спрайтами */
    rimraf = require('rimraf');								/* Для удаления папки */
    del = require('del');
    concat = require('gulp-concat');
    rename = require('gulp-rename');					/* Для переименования файлов */
    uglify = require('gulp-uglify-es').default;						
    autoprefixer = require('gulp-autoprefixer');
    sourcemaps = require('gulp-sourcemaps');


/*------------ Delete ------------*/
gulp.task('clean', async function() {
  del.sync('build')
});
/*
gulp.task('clean', function del(cb) {
  return rimraf('build', cb);
});
*/

/*------------Server------------*/
gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			port: 9000,
			baseDir: "build"			/* Файл index.html, куда будет смотреть сервер и который он будет запускать, будет находиться в папке build */
		}
	});
	gulp.watch('build/**/*').on('change', browserSync.reload);	/* Сервер следит за всеми файлами, которые на выходе, и будет обновлять браузер в случае их изменения на порту 9000 */
});

/*------------Pug compile------------*/
gulp.task('pug', function buildHTML() {
	return gulp.src('source/template/*.pug')
		.pipe(pug({
		pretty: true 		/* Для того, чтобы после компиляции код НЕ был в одну линию. По умолчанию PUG компилирует код в одну строку и он становится нечитаемым. */
	}))
		.pipe(gulp.dest('build'));
});

/*------------Styles compile------------*/
gulp.task('scss', function() {
	return gulp.src('source/scss/*.scss')					     	/* 1. Выбираются все scss-файлы */
		.pipe(sass({outputStyle: 'compressed'}))	       /* 2. Компилируются в CSS и при этом сжимаются. Вместо 'compressed' можно написать 'expanded' и код в CSS будет красиво выровнен */
		.pipe(autoprefixer({														/* 3. Добавляются вендорные префиксы для кроссбраузерности */
			overrideBrowserlist: ['last 8 versions']
		}))
		.pipe(rename({suffix: '.min'}))														/* Переименовываем в main.min.css, чтобы было видно, что он минифицированный */
	  .pipe(gulp.dest('build/css'))
	  .pipe(browserSync.reload({stream: true}))
});

/*------------Scripts compile------------*/
gulp.task('script', function () {
  return gulp.src('source/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
    .pipe(browserSync.reload({stream: true}))
});

/*------------Sprite------------*/
/* Для того, чтобы взять все иконки (здесь в формате png) и создать из них спрайт */
gulp.task('sprite', function(cb) {
	const spriteData = gulp.src('source/images/icons/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		imgPath: '../images/sprite.png',
		cssName: 'sprite.scss'
	}));

	spriteData.img.pipe(gulp.dest('build/images/'));
	spriteData.css.pipe(gulp.dest('source/scss/global/'));
	cb();
});

/*------------ Copy fonts ------------*/
gulp.task('fonts', function() {
	return gulp.src('./source/fonts/**/*.*')
		.pipe(gulp.dest('build/fonts'));
});

/*------------ Copy images ------------*/
gulp.task('images', function() {
	return gulp.src('./source/images/**/*.*')
		.pipe(gulp.dest('build/images'));
});

/*------------ Copy CSS ------------*/
/*
gulp.task('css', function() {
  return gulp.src([
    'node_modules/normalize.css/normalize.css',
    'node_modules/slick-carousel/slick/slick.css',
    'node_modules/magnific-popup/dist/magnific-popup.css'
    ])
    .pipe(gulp.dest('build/css'));
});
/*
/* или ВАРИАНТ 2: */
/*
gulp.task('css', function() {
  return gulp.src([
    'node_modules/normalize.css/normalize.css',
    'node_modules/slick-carousel/slick/slick.css',
    'node_modules/magnific-popup/dist/magnific-popup.css'
    ])
    .pipe(concat('_libs.scss'))
    .pipe(gulp.dest('source/scss'));
    .pipe(browserSync.reload({stream: true}))
});
*/

/*------------ Copy JS ------------*/
gulp.task('js', function() {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/magnific-popup/dist/jquery.magnific-popup.js'
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('source/js'))
    .pipe(browserSync.reload({stream: true}))
});


/*------------ Copy ------------*/
/* Данная задача одновременно запускает копир. шрифтов и копир. картинок, чтобы не запускать их по отдельности */
gulp.task('copy', gulp.parallel('fonts', 'images'));


/*------------Watchers------------*/														/* Вочеры, которые постоянно отслеживают определенные измемнения */
gulp.task('watch', function() {
	gulp.watch('source/template/**/*.pug', gulp.parallel('pug'));	/* 1. Если изменяется любой pug-файл, то будет запускаться уже созданная задача 'pug' и происходить компиляция файла */
	gulp.watch('source/scss/**/*.scss', gulp.parallel('scss'));		/* 2. Аналогично. При изменении scss-файлов запускается таск на компиляцию в CSS */
	gulp.watch('source/js/*.js', gulp.parallel('script'));
});


/************* Дефолтный таск. **************/
/* Когда в консоли напишем слово gulp, запустится то, что внутри данного таска */
gulp.task('default', gulp.series(
	'clean',
	gulp.parallel('pug', 'scss', 'js', 'script', 'sprite', 'copy'),
    gulp.parallel('watch', 'browser-sync')
	)
);