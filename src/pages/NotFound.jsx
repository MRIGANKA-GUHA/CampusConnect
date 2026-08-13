import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap');

        .nf-root {
          font-family: 'Fira Sans', sans-serif;
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          color: #f5f6fa;
        }

        /* Background gradient */
        .nf-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(#0C0E10, #446182);
          z-index: 0;
        }

        /* Content wrapper */
        .nf-container {
          position: relative;
          z-index: 2;
          margin: 0 auto;
          width: 85%;
          height: 100vh;
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
        }

        /* Left section */
        .nf-left {
          position: relative;
          width: 40%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nf-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .nf-heading {
          text-align: center;
          font-size: 9em;
          font-weight: 700;
          line-height: 1.3em;
          margin: 2rem 0 0.5rem 0;
          padding: 0;
          animation: nf-glow 5s ease-in-out infinite;
        }

        .nf-subheading {
          text-align: center;
          max-width: 480px;
          font-size: 1.5em;
          line-height: 1.15em;
          padding: 0 1rem;
          margin: 0 auto;
        }

        .nf-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2.5rem;
          padding: 0.85rem 2.2rem;
          background: #f5f6fa;
          color: #0C0E10;
          font-family: 'Fira Sans', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          border-radius: 9999px;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .nf-btn:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(0,0,0,0.4);
        }

        /* Right section */
        .nf-right {
          position: relative;
          width: 50%;
          height: 100%;
        }

        .nf-svg {
          position: absolute;
          bottom: 0;
          padding-top: 10vh;
          padding-left: 1vh;
          max-width: 100%;
          max-height: 100%;
        }

        /* SVG styles */
        .bench-legs { fill: #0C0E10; }
        .top-bench, .bottom-bench {
          stroke: #0C0E10;
          stroke-width: 1px;
          fill: #5B3E2B;
        }
        .bottom-bench path:nth-child(1) { fill: #4a3122; }
        .lamp-details { fill: #202425; }
        .lamp-accent { fill: #2a3235; }
        .lamp-bottom { fill: #202425; }
        .lamp-light { fill: #EFEFEF; }

        @keyframes nf-glow {
          0%   { text-shadow: 0 0 1rem #fefefe; }
          50%  { text-shadow: 0 0 1.85rem #ededed; }
          100% { text-shadow: 0 0 1rem #fefefe; }
        }

        /* Responsive — mobile */
        @media (max-width: 770px) {
          .nf-ground { height: 0; }

          .nf-container {
            flex-direction: column;
            padding-bottom: 0;
            justify-content: flex-start;
            align-items: stretch;
          }

          .nf-left {
            width: 100%;
            height: 40%;
            position: absolute;
            top: 0;
          }

          .nf-inner {
            padding: 1rem 0;
            position: relative;
          }

          .nf-heading {
            font-size: 7em;
            line-height: 1.15;
            margin: 0;
          }

          .nf-subheading {
            font-size: 1.3em;
            max-width: 100%;
          }

          .nf-right {
            width: 100%;
            height: 60%;
            position: absolute;
            bottom: 0;
          }

          .nf-svg {
            padding: 0;
          }
        }
      `}</style>

      <div className="nf-root">
        {/* Background */}
        <div className="nf-bg" />

        <div className="nf-container">
          {/* Left — Text */}
          <div className="nf-left">
            <div className="nf-inner">
              <h1 className="nf-heading">404</h1>
              <p className="nf-subheading">
                Looks like the page you were looking for is no longer here.
              </p>
              <Link to="/" className="nf-btn">
                <Home size={18} />
                Return Home
              </Link>
            </div>
          </div>

          {/* Right — SVG Scene */}
          <div className="nf-right">
            <svg
              className="nf-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="51.5 -15.288 385 505.565"
            >
              <g className="bench-legs">
                <path d="M202.778,391.666h11.111v98.611h-11.111V391.666z M370.833,390.277h11.111v100h-11.111V390.277z M183.333,456.944h11.111
                v33.333h-11.111V456.944z M393.056,456.944h11.111v33.333h-11.111V456.944z" />
              </g>
              <g className="top-bench">
                <path d="M396.527,397.917c0,1.534-1.243,2.777-2.777,2.777H190.972c-1.534,0-2.778-1.243-2.778-2.777v-8.333
                c0-1.535,1.244-2.778,2.778-2.778H393.75c1.534,0,2.777,1.243,2.777,2.778V397.917z M400.694,414.583
                c0,1.534-1.243,2.778-2.777,2.778H188.194c-1.534,0-2.778-1.244-2.778-2.778v-8.333c0-1.534,1.244-2.777,2.778-2.777h209.723
                c1.534,0,2.777,1.243,2.777,2.777V414.583z M403.473,431.25c0,1.534-1.244,2.777-2.778,2.777H184.028
                c-1.534,0-2.778-1.243-2.778-2.777v-8.333c0-1.534,1.244-2.778,2.778-2.778h216.667c1.534,0,2.778,1.244,2.778,2.778V431.25z" />
              </g>
              <g className="bottom-bench">
                <path d="M417.361,459.027c0,0.769-1.244,1.39-2.778,1.39H170.139c-1.533,0-2.777-0.621-2.777-1.39v-4.86
                c0-0.769,1.244-0.694,2.777-0.694h244.444c1.534,0,2.778-0.074,2.778,0.694V459.027z" />
                <path d="M185.417,443.75H400c0,0,18.143,9.721,17.361,10.417l-250-0.696C167.303,451.65,185.417,443.75,185.417,443.75z" />
              </g>
              <g id="lamp">
                <path className="lamp-details" d="M125.694,421.997c0,1.257-0.73,3.697-1.633,3.697H113.44c-0.903,0-1.633-2.44-1.633-3.697V84.917
                c0-1.257,0.73-2.278,1.633-2.278h10.621c0.903,0,1.633,1.02,1.633,2.278V421.997z" />
                <path className="lamp-accent" d="M128.472,93.75c0,1.534-1.244,2.778-2.778,2.778h-13.889c-1.534,0-2.778-1.244-2.778-2.778V79.861
                c0-1.534,1.244-2.778,2.778-2.778h13.889c1.534,0,2.778,1.244,2.778,2.778V93.75z" />
                <circle className="lamp-light" cx="119.676" cy="44.22" r="40.51" />
                <path className="lamp-details" d="M149.306,71.528c0,3.242-13.37,13.889-29.861,13.889S89.583,75.232,89.583,71.528c0-4.166,13.369-13.889,29.861-13.889
                S149.306,67.362,149.306,71.528z" />
                <radialGradient id="SVGID_1_" cx="119.676" cy="44.22" r="65" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#EDEDED', stopOpacity: 0.5 }}>
                    <animate attributeName="stop-opacity" values="0.0; 0.5; 0.0" dur="5000ms" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" style={{ stopColor: '#EDEDED', stopOpacity: 0 }} />
                </radialGradient>
                <circle fill="url(#SVGID_1_)" cx="119.676" cy="44.22" r="65" />
                <path className="lamp-bottom" d="M135.417,487.781c0,1.378-1.244,2.496-2.778,2.496H106.25c-1.534,0-2.778-1.118-2.778-2.496v-74.869
                c0-1.378,1.244-2.495,2.778-2.495h26.389c1.534,0,2.778,1.117,2.778,2.495V487.781z" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
