import buildClient from '../api/build-client';

const HomePage = ({ currentUser }) => {
  console.log('Current user at render:', currentUser); // This will show you what the current user value is at render time.
  
  if (currentUser && currentUser.currentUser) {
    return <h1>You are signed in</h1>;
  } else {
    return <h1>You are not signed in</h1>;
  }
};


HomePage.getInitialProps = async (context) => {
  try {
    const { data } = await buildClient(context).get('/api/users/currentuser');

    console.log('Current user:', data);
    return { currentUser: data || null };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return { currentUser: null }; // Ensuring an object is always returned
  }
};


export default HomePage;