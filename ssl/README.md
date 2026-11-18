# SSL Certificates for MoA Gym

For production HTTPS deployment:
1. Place your valid SSL certificate chain in `ssl/fullchain.pem`.
2. Place your private key in `ssl/privkey.pem`.

### Testing / Intranet Self-Signed Certificate:
To generate self-signed certificates for local staging or intranet LAN testing:

```bash
# On Linux / macOS / Git Bash:
openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=ET/ST=Addis Ababa/L=Addis Ababa/O=Ministry of Agriculture/CN=gym.moa.gov.et"
```

In production, use the official Ministry of Agriculture wildcard or dedicated domain certificate.
