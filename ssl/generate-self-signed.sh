#!/bin/sh
# Generate self-signed certificate for MoA Gym staging / intranet testing
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -keyout "$DIR/privkey.pem" \
  -out "$DIR/fullchain.pem" \
  -subj "/C=ET/ST=Addis Ababa/L=Addis Ababa/O=Ministry of Agriculture/CN=gym.moa.gov.et"
echo "Generated $DIR/privkey.pem and $DIR/fullchain.pem successfully."
