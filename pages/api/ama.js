import moment from 'moment';

const { model } = require('../../model.json');

const getOptimalTimes = (times, weekStart) => {
  const workingTimes = times;
  let numResults = 0;
  const optimalTimes = [];

  while (numResults < 10) {
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

export default (req, res) => {
  if (req.method === 'GET') {
    const requestedDate = moment(req.query.date);
    const weekStart = requestedDate.startOf('week');

    const calendarTimes = getOptimalTimes(model, weekStart);
    console.log(calendarTimes);

    res.status(200).json(calendarTimes);
  }
};
