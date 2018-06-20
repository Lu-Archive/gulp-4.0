import gulp from 'gulp';
import { dev } from './gulp/dev';
import { build } from './gulp/build';

gulp.task('dev', dev);
gulp.task('build', build);