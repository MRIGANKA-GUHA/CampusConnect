import React from 'react';
import styled from 'styled-components';

const ThemeSwitch = () => {
  const handleToggle = (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <StyledWrapper>
      <label htmlFor="theme" className="theme">
        <span className="theme__toggle-wrap">
          <input 
            id="theme" 
            className="theme__toggle" 
            type="checkbox" 
            role="switch" 
            name="theme" 
            defaultValue="dark" 
            onChange={handleToggle}
          />
          <span className="theme__icon">
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
          </span>
        </span>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .theme {
    --bg: #000000;
    --transDur: 0.5s;
    --primary: #6366f1;
    
    display: flex;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
    font-size: 8px; 
    cursor: pointer;
  }

  .theme__toggle-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .theme__toggle {
    background-color: #fcd34d;
    border-radius: 999px;
    width: 6em;
    height: 3em;
    -webkit-appearance: none;
    appearance: none;
    transition: background-color var(--transDur) cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: none;
    outline: none;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }

  .theme__toggle:checked {
    background-color: #1e1b4b;
  }

  .theme__icon {
    position: absolute;
    top: 0.25em;
    left: 0.25em;
    width: 2.5em;
    height: 2.5em;
    pointer-events: none;
    transition: transform var(--transDur) cubic-bezier(0.4, 0, 0.2, 1);
  }

  .theme__icon-part {
    position: absolute;
    inset: 0;
    background-color: #f59e0b;
    border-radius: 50%;
    transition: all var(--transDur) cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Rays for the sun */
  .theme__icon-part:not(:first-child) {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.2em;
    height: 0.6em;
    background-color: #f59e0b;
    border-radius: 0.1em;
    transform-origin: center -0.8em;
  }

  .theme__icon-part:nth-child(2) { transform: translate(-50%, 0.8em) rotate(0deg); }
  .theme__icon-part:nth-child(3) { transform: translate(-50%, 0.8em) rotate(45deg); }
  .theme__icon-part:nth-child(4) { transform: translate(-50%, 0.8em) rotate(90deg); }
  .theme__icon-part:nth-child(5) { transform: translate(-50%, 0.8em) rotate(135deg); }
  .theme__icon-part:nth-child(6) { transform: translate(-50%, 0.8em) rotate(180deg); }
  .theme__icon-part:nth-child(7) { transform: translate(-50%, 0.8em) rotate(225deg); }
  .theme__icon-part:nth-child(8) { transform: translate(-50%, 0.8em) rotate(270deg); }
  .theme__icon-part:nth-child(9) { transform: translate(-50%, 0.8em) rotate(315deg); }

  /* Checked state logic */
  .theme__toggle:checked ~ .theme__icon {
    transform: translateX(3em);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:first-child {
    background-color: #e0e7ff;
    box-shadow: inset -0.8em 0.4em 0 0 #1e1b4b;
    transform: scale(1.1);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:not(:first-child) {
    opacity: 0;
    transform: translate(-50%, 0) scale(0);
  }
`;

export default ThemeSwitch;
