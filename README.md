# Extreme Carpaccio

[![CI](https://github.com/kumojin/extreme-carpaccio/actions/workflows/ci.yml/badge.svg)](https://github.com/kumojin/extreme-carpaccio/actions/workflows/ci.yml)

> This is a fork from [dlresende/extreme-carpaccio](https://github.com/dlresende/extreme-carpaccio).

French version [here](./README-FR.md).

Extreme Carpaccio is a coding game designed to encourage and favour incremental development and Continuous Delivery best practices.

During a Extreme Carpaccio session, the facilitator uses his/her computer as a server and sends HTTP requests to participant machines (generally organised in teams). Each request is a purchasing order, like those you have when you buy something somewhere. Participants then calculate the order's total amount and send the correct response back to the server. For every correct response, the participant earns points and increases his/her score. For bad responses, penalties are charged and the participant loses points. Participants should slice (or decouple) the problem in order to deploy small chunks of the solution into production as soon as possible and then score before others. This is the purpose of this exercise: define a slicing strategy, implement, deploy, check feedback, adapt the strategy, implement, deploy... and iterate as fast as possible. **Those who don't slice and try go to production only once the whole solution is implemented risk to spend too much time before scoring, leaving the way free to other teams win.**

This workshop, kata, or coding game is intented to help teams to practice concepts like Continuous Delivery, Lean Startup, eXtreme Programming, Agile Development, and more.

Ready for the challenge?

If you are a **participant**, go to [clients/](./clients/README.md) to get more instructions and start playing.

If you are a **facilitator**, go to [server/](./server/README.md) and find out how to facilitate a session.

Have fun :D

## People running Extreme Carpaccio

- Find out what people are saying about Extreme Carpaccio on [Twitter](https://twitter.com/search?vertical=default&q=%22extreme%20carpaccio%22%20OR%20%22Xtreme%20carpaccio%22%20OR%20%23ExtremeCarpaccio&src=typd)

  cypress11:
    image: cypress/included:cypress-12.5.1-node-16.18.1-chrome-110.0.5481.96-1-ff-109.0-edge-110.0.1587.41-1
    entrypoint: /bin/sh -c "cd ./apps/frontend && npm install esbuild-wasm && CYPRESS_BASE_URL=<http://127.0.0.1> cypress run --headless --browser chrome"
    depends_on:
      - front
    working_dir: /test
    volumes:
      - ./:/test
      - /tmp/.X11-unix:/tmp/.X11-unix
