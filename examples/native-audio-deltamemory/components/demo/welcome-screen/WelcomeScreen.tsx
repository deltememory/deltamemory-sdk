/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './WelcomeScreen.css';
import { useUserStore } from '../../../lib/state';

const WelcomeScreen: React.FC = () => {
  const { currentUser } = useUserStore();
  
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="title-container">
          <span className="welcome-icon">support_agent</span>
          <h2>Customer Support</h2>
        </div>
        <p>Hi {currentUser.name.split(' ')[0]}, I'm your AI support agent with persistent memory.</p>
        <div className="example-prompts">
          <div className="prompt">I'd like to return an item</div>
          <div className="prompt">What's the status of my order?</div>
          <div className="prompt">I prefer express shipping</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
