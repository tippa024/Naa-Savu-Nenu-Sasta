import Head from 'next/head'
import Map from '@/components/Map'
import Stars from '@/components/Stars'


export default function Home() {


  return (
    <>
      <Head>
        <title>Naa Savu Nenu Sasta</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Play.ico" />
      </Head>
      <main>
        <div>
          <div>
            <Map />
          </div>
        </div>
        <div>
          <Stars />
        </div>
      </main>
    </>
  )
}
