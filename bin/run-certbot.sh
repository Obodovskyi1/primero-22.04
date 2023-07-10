#! /bin/sh
set -ex
exec /srv/primero/bin/certbot -d "bal.opmcpims.com" --cert-name "primero" -m "obodovskyiwork@gmail.com" -p "primero" "${@}"
