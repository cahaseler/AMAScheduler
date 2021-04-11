import Head from 'next/head';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  const [amaDate, setAmaDate] = useState(new Date());
  const [suggestedDates, setSuggestedDates] = useState([]);

  const submitDate = () => {
    axios.get(`/api/ama?date=${amaDate}`).then((response) => {
      setSuggestedDates(response);
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h6 className={styles.title}>
          Welcome to Craig&apos;s AMA Scheduler
        </h6>

        <Form>
          <Form.Group>
            <Form.Label>Approximate Date of AMA</Form.Label>
            <DatePicker selected={amaDate} onChange={(date) => setAmaDate(date)} />
          </Form.Group>
          <Button onClick={submitDate()}>Get Suggested Dates</Button>
        </Form>

        <p>
          More information can be found on the
          {' '}
          <a href="https://github.com/cahaseler/amascheduler">public github page.</a>
        </p>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by
          {' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  );
}
