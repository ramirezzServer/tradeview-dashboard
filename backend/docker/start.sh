#!/bin/sh
set -e

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan event:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
