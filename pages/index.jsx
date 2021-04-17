import Head from 'next/head';
import { useState } from 'react';
import * as React from 'react';
import {
  Container, Form, Button, Row, Col, Spinner,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import WeekCalendar from 'react-week-calendar';
import moment from 'moment';
import styles from '../styles/Home.module.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-week-calendar/dist/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class CustomEvent extends React.PureComponent {
  render() {
    const {
      start,
      end,
      value,
    } = this.props;
    if (value === 'Suggested') {
      return (
        <div className="event">
          Suggested
        </div>
      );
    }
    return (
      <div className="event" style={{ backgroundColor: '#FFCCCB' }}>
        {value}
      </div>
    );
  }
}

function Calendar({ loading, suggestedDates, amaDate }) {
  const startDay = moment(amaDate).startOf('week');
  if (loading === 'spinning') {
    return (
      <Row>
        <Col />
        <Col md="auto">
          <Row style={{ marginBottom: '20em' }}>
            <h3>Calculating... </h3>
            <Spinner animation="border" />
          </Row>
        </Col>
        <Col />
      </Row>
    );
  }
  if (loading === 'loaded') {
    const momentDates = suggestedDates;
    momentDates.forEach((date, index) => {
      momentDates[index].start = moment(date.start);
      momentDates[index].end = moment(date.end);
    });
    return (
      <>
        <Row>
          <Col />
          <Col md="auto">
            <h4>
              In the week of
              {' '}
              {startDay.format('MMMM Do YYYY')}
              , we reccomend the following times for an AMA:
            </h4>

          </Col>
          <Col />
        </Row>
        <Row>
          <Col />
          <Col>
            <h5>
              <ul>
                {momentDates.map((ama) => {
                  if (ama.value === 'Suggested') {
                    return <li>{ama.start.format('ha   MMMM Do YYYY')}</li>;
                  }
                })}
              </ul>
            </h5>
          </Col>
          <Col />

        </Row>

        <Row>
          <Col />
          <Col md="auto">
            <h5>
              {' '}
              Once you've decided on a time, you can schedule your ama at
              {' '}
              <a href="https://askmeanythi.ng">https://askmeanythi.ng</a>
            </h5>
          </Col>
          <Col />
        </Row>

        <WeekCalendar
          startTime={moment({ h: 6, m: 0 })}
          firstDay={startDay}
          scaleUnit={60}
          useModal={false}
          dayFormat="ddd, MM/DD"
          selectedIntervals={suggestedDates}
          eventComponent={CustomEvent}
          cellHeight={50}
        />
      </>
    );
  }
  return <div />;
}

function refreshPage() {
  window.location.reload();
}

function DateForm({
  amaDate, submitDate, setAmaDate, loading,
}) {
  if (loading === 'waiting') {
    return (
      <Form>
        <Form.Group>
          <Form.Label style={{ paddingRight: '1em' }}>Approximate Date of AMA: </Form.Label>
          <DatePicker selected={amaDate} onChange={(date) => setAmaDate(date)} />
          <Button onClick={submitDate} style={{ marginLeft: '1em', marginTop: '-0.4em' }}>Get Suggested Dates</Button>
        </Form.Group>

      </Form>
    );
  }
  if (loading === 'loaded') {
    return (
      <Form>
        <Form.Group>
          <Form.Label style={{ paddingRight: '1em' }}>Approximate Date of AMA: </Form.Label>
          <DatePicker selected={amaDate} readOnly />
          <Button onClick={refreshPage} style={{ marginLeft: '1em', marginTop: '-0.4em' }}>Reset</Button>
        </Form.Group>

      </Form>
    );
  }
  return (
    <Form>
      <Form.Group>
        <Form.Label style={{ paddingRight: '1em' }}>Approximate Date of AMA: </Form.Label>
        <DatePicker selected={amaDate} readOnly />
      </Form.Group>

    </Form>
  );
}

export default function Home() {
  const [amaDate, setAmaDate] = useState(moment().add(1, 'w').toDate());
  const [suggestedDates, setSuggestedDates] = useState([]);
  const [loading, setLoading] = useState('waiting');

  const submitDate = () => {
    setLoading('spinning');
    axios.get(`/api/ama?date=${amaDate.toISOString()}`).then((response) => {
      setSuggestedDates(response.data);
      console.log(response.data);
      setLoading('loaded');
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Container>
          <Row>
            <Col />
            <Col md="auto">
              <h3 className={styles.title}>
                Optimal AMA Time Calculator
              </h3>

            </Col>
            <Col />
          </Row>
          <Row style={{ marginTop: '2em' }}>
            <Col />
            <Col md="auto">
              <h5>
                This tool can be used to get suggested times for an AMA. When provided with an approximate date,
                it uses a model based on data from over 11,000 previous AMAs to determine ideal times to maximize
                traffic to the AMA. The calculation then takes into account AMAs that are already scheduled in order to provide reasonable suggestions.
                {' '}

              </h5>
            </Col>
            {' '}
            <Col />
          </Row>
          <Row style={{ marginTop: '2em' }}>
            <Col />
            <Col md="auto">
              <DateForm amaDate={amaDate} submitDate={submitDate} setAmaDate={setAmaDate} loading={loading} />
            </Col>
            <Col />
          </Row>

          <Calendar loading={loading} suggestedDates={suggestedDates} amaDate={amaDate} />

          <Row>
            <Col />
            <Col md="auto">
              <p>
                This project is open source. More information can be found on the
                {' '}

                <a href="https://github.com/cahaseler/amascheduler">public github page.</a>
              </p>

            </Col>
            <Col />
          </Row>
        </Container>
      </main>

    </div>
  );
}
