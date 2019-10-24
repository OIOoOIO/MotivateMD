import Document, { Main, NextScript, Head } from 'next/document'
import '../assets/stylesheets/application.scss';

export default class MyDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <link rel="stylesheet" href={`/_next/${this.props.buildManifest.css[0]}`} />
          <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet"></link>
        </Head>
        <body>
          <Main/>
          <NextScript />
        </body>
      </html>
    )
  }
}
