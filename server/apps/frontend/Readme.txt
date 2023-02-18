
    entrypoint: /bin/sh -c " CYPRESS_BASE_URL=http://front:3000 cypress run --headless  --browser chrome"


Faire un npm install avant,
docker build -f Dockerfile -t front .
docker run -it -p 4001:3000 front 
docker-compose up --abort-on-container-exit --exit-code-from cypress

Il faut modifier l'adresse environnement ? 