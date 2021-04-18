/* eslint-disable max-len */
import moment from 'moment';

const PublicGoogleCalendar = require('public-google-calendar');
const { model } = require('../../model.json');

const getOptimalTimes = (times, weekStart) => {
  const workingTimes = times;
  let numResults = 0;
  const optimalTimes = [];

  while (numResults < 6) {
    const indexOfMaxValue = workingTimes.indexOf(Math.max(...workingTimes));
    workingTimes.splice(indexOfMaxValue, 1, 0);
    let sufficientlyDifferent = true;
    optimalTimes.forEach((time) => {
      if (Math.abs(indexOfMaxValue - time) < 3) {
        sufficientlyDifferent = false;
      }
    });
    if (sufficientlyDifferent) {
      optimalTimes.push(indexOfMaxValue);
      numResults += 1;
    }
  }

  const calendarTimes = [];
  optimalTimes.forEach((time) => {
    const momentTime = weekStart.clone().add(time + 4, 'hours');
    calendarTimes.push(momentTime.format());
  });

  return calendarTimes;
};

const convertToIntervals = (calendarTimes, amasThisWeek) => {
  const intervals = [];
  calendarTimes.forEach((time, index) => {
    intervals.push(
      {
        uid: index,
        start: moment(time).add(4, 'h'),
        end: moment(time).clone().add(5, 'h'),
        value: 'Suggested',
      },
    );
  });
  amasThisWeek.forEach((ama, index) => {
    let amaTitle = '';
    if (ama.summary.includes('[')) {
      amaTitle = ama.summary.substring(ama.summary.indexOf('[') + 1, ama.summary.indexOf(']'));
    } else {
      amaTitle = ama.summary;
    }
    intervals.push(
      {
        uid: calendarTimes.length + index,
        start: moment(ama.start),
        end: moment(ama.end),
        value: amaTitle,
      },
    );
  });
  return intervals;
};

export default async (req, res) => {
  if (req.method === 'GET') {
    const requestedDate = moment(req.query.date).startOf('day');
    const weekStart = requestedDate.clone().startOf('week');
    console.log(weekStart);
    const weekEnd = weekStart.clone();
    weekEnd.add(1, 'w');

    const customModel = [0, 3, 4, 7, 3, 7, 0, 5, 7, 8, 7, 6, 6, 4, 4, 4, 3, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 1, 2, 6, 5, 5, 6, 5, 5, 4,
      4, 3, 4, 3, 2, 3, 3, 2, 4, 2, 4, 1, 2, 3, 2, 1, 4, 3, 6, 5, 4, 6, 6, 4, 3, 3, 3, 3, 3, 3, 2, 3, 3, 4, 3, 2, 3, 4, 3, 2,
      6, 6, 4, 3, 6, 5, 3, 3, 3, 2, 3, 2, 3, 2, 3, 3, 4, 2, 1, 1, 2, 0, 2, 5, 9, 6, 4, 5, 6, 5, 4, 3, 3, 3, 2, 2, 3, 3, 3, 3,
      2, 2, 2, 3, 2, 2, 2, 1, 2, 6, 7, 6, 6, 6, 4, 3, 3, 3, 3, 2, 3, 3, 3, 4, 3, 3, 3, 2, 2, 0, 4, 3, 10, 8, 8, 8, 8, 7, 6, 6,
      4, 5, 4, 3, 3, 4, 2, 3, 1, 4, 5];
    console.log(`model:${customModel.reduce((a, b) => a + b, 0)}`);
    const amaCalendar = new PublicGoogleCalendar({ calendarId: 'amaverify@gmail.com' });

    return new Promise((resolve) => {
      amaCalendar.getEvents((err, events) => {
        // eslint-disable-next-line no-console
        if (err) {
          console.log(err.message);
          res.status(500);
          return resolve();
        }
        console.log(`Week start:${weekStart} Week end: ${weekEnd}`);
        const amasThisWeek = events.filter((ama) => moment(ama.start).isAfter(weekStart) && moment(ama.start).isBefore(weekEnd));
        amasThisWeek.forEach((ama) => {
          const startHour = moment.duration(moment(ama.start).diff(weekStart)).asHours();
          // console.log(startHour);
          customModel[startHour] -= 4;
          customModel[startHour + 1] -= 4;
          customModel[startHour + 2] -= 2;
        });
        const requestedHour = moment.duration(requestedDate.clone().startOf('day').diff(weekStart)).asHours() + 6;
        for (let i = 0; i <= 12; i += 1) {
          customModel[requestedHour + i] += 2;
          if (customModel[requestedHour + i] > 10) {
            customModel[requestedHour + i] = 10;
          }
        }

        console.log(`model:${customModel.reduce((a, b) => a + b, 0)}`);
        const calendarTimes = getOptimalTimes(customModel, weekStart);

        // console.log(calendarTimes);
        res.status(200).json(convertToIntervals(calendarTimes, amasThisWeek));
        return resolve();
      });
    });
  }
  return res.status(400);
};
