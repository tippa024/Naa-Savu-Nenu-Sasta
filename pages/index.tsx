import Head from 'next/head'
import Header from '@/components/Head'
import Map from '@/components/Map'



export default function Home() {
  return (
    <>
      <Head>
        <title>TMaps</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header/>
        <Map/>
      </main>
    </>
  )
}
