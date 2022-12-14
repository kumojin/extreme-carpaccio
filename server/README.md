[![build status](https://travis-ci.org/dlresende/extreme-carpaccio.svg?branch=master)]()

# Instructions for Facilitators

French version [here](./README-FR.md).

## Requirements

- [nodejs](https://nodejs.org/en/)

## Install & Run

```
npm install
npm start
```

## Start a new workshop

If you had previously run a workshop you should **delete** the previous database located at: `apps/backend/backup.db`.

This database ensure that you **can restart the server without losing the current cash** of the players.

## Test the network

During the workshop, HTTP packages will be exchanged between participant's computers and the server. Although, many networks block incoming connections using
firewalls, which will prevent the server from reaching participants.

Before you start an Extreme Carpaccio workshop, it is strongly recommended that you test if the network you will playing with accepts incoming connections.
Follow the instructions bellow.

1. Connect a first computer in the network
2. In that computer run: `$ echo "Hello Extreme Carpaccio" | nc -l 3000`
3. Connect a second computer in the network
4. In the second computer run: `$ nc <IP address of the 1st computer> 3000 | tee `
5. If the network allows incoming connections, you should see the message `Hello Extreme Carpaccio` appearing in the second computer

## Freeze the game to make everyone start at the same time

People will take time to setup their HTTP server. Some of them will need more time than others, because of setup problems.

As a facilitator, you may want everyone to be ready before starting the game, to be fair with people that had problems.

You can do this way:

1. Open `configuration.json` file
2. Replace `"cashFreeze": false,` with `"cashFreeze": true,` and save
3. Start the game server with `npm start`
4. Make everyone register
5. Thanks to the `cashFreeze` parameter, everyone's cash stays at 0.
6. Wait until every team is registered **and marked online**. This means the game is setup for everyone.
7. Say '_Looks like that everyone is ready. Then I will start the game in 5 seconds._'
8. Open `configuration.json` file
9. Replace `"cashFreeze": true,` with `"cashFreeze": false,` and save
10. Players' cash is now evaluated. The game starts!

## Workshop

Extreme Carpaccio is intended to be played with Product Owners (PO) and Developers together. It can be played with only Developers, but slicing strategies tend
to be more biased since developers generally focus more on code and than on product and iterations.

The workshop has mainly 3 stages: slicing, implementation and retrospective. A session normally takes between 1:30 and 3:00 hours.

### Start

At the beginning, the facilitator exposes the problem to be solved to participants. The participants then form teams between 2-4 (ideally) and try to understand
and slice the problem, and together define an implementation strategy, based on product value perspective and technical challenges trade-offs.

Next, the facilitator starts the server and makes sure all the teams are able to exchange HTTP messages with the server. Once everyone is ready, the facilitator
allows teams to start implementing (normally requires restarting the server to reset the score) and people start playing.

### Constraints

During the session, the facilitator can activate some "constraints" via the [configuration.json file](./apps/backend/configuration.json), in order to bring some
chaos to the game and shake the score. Some examples are: send bad requests (**in which case participants should respond 400 - bad request**); change reduction
strategies; change tax rules; charge downtime; etc. Any change to this file is automatically taken into account, no need to restart the server. It is up to the
facilitator to announce when he/she triggers a constraint, based on how he/she wants to conduct the session.

### Reduction Strategies

Available reduction strategies are:

- `STANDARD` (default),
- `HALF PRICE`
- `PAY THE PRICE`

In the [configuration.json file](./apps/backend/configuration.json), you can specify either:

- only one reduction strategy (e.g. `"STANDARD"`),
- an array of reduction strategy (e.g. `["HALF PRICE, "PAY THE PRICE"]`)
- an array of reductions and weights (between 0 and 1) (e.g. `[{"reduction":"HALF PRICE, "weight":0.1}, {"reduction":"PAY THE PRICE", "weight":0.5}]`)

### Conclusion and retrospective

At the end, when the facilitator decides to stop the implementation session and the winner becomes known, he/she takes some time at to exchange with
participants about the exercise: what worked well, what could be improved, feedbacks, learnings, etc.

I strongly encourage people facilitating or playing Extreme Carpaccio to tweet using the
hashtag [#ExtremeCarpaccio](https://twitter.com/search?vertical=default&q=%22extreme%20carpaccio%22%20OR%20%22Xtreme%20carpaccio%22%20OR%20%23ExtremeCarpaccio&src=typd)
with their impressions, feelings, feedbacks, etc. Needless to say, but just in case, feel free to fork, hack, make pull requests, talk about, blog, run the
exercise on meetups, conferences, compagnies, etc.

More details about the exercise [here](https://diegolemos.net/2016/01/07/extreme-carpaccio/).
