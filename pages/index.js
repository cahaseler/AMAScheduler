import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h3 className={styles.title}>
          Welcome to Craig's AMA Scheduler
        </h3>

        <p className={styles.description}>
         This web frontend will demonstrate the functionality of the AMA Scheduling backend currently under development. In addition to providing a useful service to support the moderators and guests on Reddit's /r/IAmA subreddit, this project is serving as a capstone project for Craig's GMU BIS degree.

        </p>

        <p>The project is still in planning and infrastructure stages, so there isn't a demo here yet. Check back soon!</p>

      <p>More information can be found on the <a href="https://github.com/cahaseler/amascheduler">public github page.</a></p>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
