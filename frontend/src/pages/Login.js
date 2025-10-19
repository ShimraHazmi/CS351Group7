// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // for routing
import "../login.css"; // your styling (shared stylesheet in src/)

// placeholder images used when actual assets are missing
import placeholder from "../assets/placeholder.svg";

const vector = placeholder;
const image = placeholder;
const vector2 = placeholder;
// use the public folder image for the right-side hero image
// public files are served from site root, so '/loginImage.jpg' will resolve to public/loginImage.jpg
const image1 = '/loginImage.jpg';
const vector3 = placeholder;
const vector4 = placeholder;
const vector5 = placeholder;
const container = placeholder;
const vector6 = placeholder;


export const SignIn = () => {
  return (
    <div className="sign-in">
      <div className="login-screen">
        <div className="welcome-back-msg">
          <div className="card-header">
            <div className="app">
              <div className="container">
                <div className="icon">
                  <img className="vector" alt="Vector" src={vector} />

                  <img className="img" alt="Vector" src={image} />

                  <img className="vector-2" alt="Vector" src={vector2} />
                </div>
              </div>

              <div className="heading">
                <div className="text-wrapper">CivicConnect</div>
              </div>
            </div>

            <div className="card-title">
              <div className="div">Welcome back</div>
            </div>

            <div className="card-description">
              <p className="sign-in-to-your">
                Sign in to your account to continue engaging with your community
              </p>
            </div>
          </div>
        </div>

        <div className="email-password">
          <div className="app-2">
            <div className="primitive-label">
              <label className="label" htmlFor="input-1">
                Email
              </label>
            </div>

            <input
              className="input"
              id="input-1"
              placeholder="name@example.com"
              type="email"
            />
          </div>

          <div className="app-3">
            <div className="container-2">
              <div className="div-wrapper">
                <div className="text-wrapper-2">Password</div>
              </div>

              <div className="link">
                <div className="text-wrapper-3">Forgot password?</div>
              </div>
            </div>

            <div className="input-2">
              <div className="text-wrapper-4">Enter your password</div>
            </div>
          </div>
        </div>

        <div className="signin-box">
          <div className="card-footer">
            <button className="button">
              <div className="text-wrapper-5">Sign in</div>
            </button>

            <div className="app-4">
              <div className="text" />

              <div className="don-t-have-an-wrapper">
                <div className="don-t-have-an">Don&#39;t have an account?</div>
              </div>
            </div>

            <button className="button-2">
              <div className="text-wrapper-6">Create an account</div>
            </button>
          </div>
        </div>
      </div>

      <img className="hand-image" alt="Image" src={image1} />

      <div className="transparent-box" />

      <div className="empower-your-voice">
        <p className="p">Empower Your Voice in Democracy</p>
      </div>

      <div className="paragraph">
        <p className="join-thousands-of">
          Join thousands of citizens making their communities better through
          active participation, transparent governance, and meaningful dialogue.
        </p>
      </div>

      <div className="icon-image">
        <div className="container-4">
          <div className="circle-icon-wrapper">
            <div className="icon-2">
              <img className="vector" alt="Vector" src={vector3} />

              <img className="img" alt="Vector" src={vector4} />

              <img className="vector-2" alt="Vector" src={vector5} />
            </div>
          </div>

          <div className="container-5">
            <div className="heading-3">
              <div className="text-wrapper-7">Vote on Local Issues</div>
            </div>

            <div className="paragraph-2">
              <p className="participate-in-polls">
                Participate in polls and initiatives that shape your community
              </p>
            </div>
          </div>
        </div>

        <div className="container-4">
          <img className="container-6" alt="Container" src={container} />

          <div className="container-5">
            <div className="heading-3">
              <div className="text-wrapper-7">Connect with Representatives</div>
            </div>

            <div className="paragraph-2">
              <p className="direct-communication">
                Direct communication with elected officials and civic leaders
              </p>
            </div>
          </div>
        </div>

        <div className="container-7">
          <div className="circle-icon-wrapper">
            <div className="icon-2">
              <img className="vector-3" alt="Vector" src={vector6} />
            </div>
          </div>

          <div className="container-8">
            <div className="heading-3">
              <div className="text-wrapper-7">Join Community Discussions</div>
            </div>

            <div className="engage-in-thoughtful-wrapper">
              <p className="engage-in-thoughtful">
                Engage in thoughtful dialogue about what matters most
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Provide default export to match imports elsewhere (import Login from './pages/Login')
export default SignIn;
