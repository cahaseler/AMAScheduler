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
      if (Math.abs(indexOfMaxValue - time) < 5) {
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
        start: moment(time).add(3, 'h'),
        end: moment(time).clone().add(4, 'h'),
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
    const requestedDate = moment(req.query.date);
    const weekStart = requestedDate.startOf('week');
    console.log(weekStart);
    const weekEnd = weekStart.clone();
    weekEnd.add(1, 'w');

    const customModel = model;

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
        console.log(customModel);
        amasThisWeek.forEach((ama) => {
          const startHour = moment.duration(moment(ama.start).diff(weekStart)).asHours();
          console.log(startHour);
          customModel[startHour] -= 4;
          customModel[startHour + 1] -= 4;
          customModel[startHour + 2] -= 2;
          if (customModel[startHour] < 0) {
            customModel[startHour] = 0;
          }
          if (customModel[startHour + 1] < 0) {
            customModel[startHour + 1] = 0;
          }
          if (customModel[startHour + 2] < 0) {
            customModel[startHour + 2] = 0;
          }
        });
        console.log(customModel);
        const calendarTimes = getOptimalTimes(customModel, weekStart);

        console.log(calendarTimes);
        res.status(200).json(convertToIntervals(calendarTimes, amasThisWeek));
        return resolve();
      });
    });
  }
  return res.status(400);
};
