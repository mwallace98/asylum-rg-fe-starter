import React from 'react';

import { useAuth0,withAuthenticationRequired } from '@auth0/auth0-react';
import { Loading } from '../../Loading';
import './Profile.css';

export const Profile = () => {
    
  const { user } = useAuth0();

  if(!user){
    return <Loading />;
  }

  const {name,picture,email} = user;
  console.log(user,'user');

  

    return (
        <div className="profile-container">
          <div className="profile-card">
            <img src={picture} alt="Profile" className="profile-picture" />
            <div className="profile-details">
              <h2>{name}</h2>
              <p>Email: {email}</p>
            </div>
          </div>
        </div>
  );
};

export default withAuthenticationRequired(Profile,{
    onRedirecting: () => <Loading />
});