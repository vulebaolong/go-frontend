docker compose down

docker rmi img-go_frontend:latest

set -a
source .env
set +a

docker build \
 -t img-go_frontend:latest \
 --build-arg NEXT_PUBLIC_BASE_DOMAIN_BE="$NEXT_PUBLIC_BASE_DOMAIN_BE" \
  --build-arg NEXT_PUBLIC_BASE_DOMAIN_CLOUDINARY="$NEXT_PUBLIC_BASE_DOMAIN_CLOUDINARY" \
 .

docker builder prune -a -f


docker compose up -d