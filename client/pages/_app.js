import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  console.log('currentUser:', currentUser);
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {

  const client = buildClient(appContext.ctx);
  let pageProps = {};
  try {
    const { data } = await client.get('/api/users/currentuser');
    console.log('Fetched currentUser data:', data);
    
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return {
    pageProps,
    ...data
  };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return { pageProps, currentUser: null };
  }
};

export default AppComponent;
