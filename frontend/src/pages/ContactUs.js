import React from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhoneCall, FiMapPin, FiClock } from 'react-icons/fi';
import '../css/contactus.css';

function ContactUs() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="contact-us">
      <header className="topbar">
        <h1>About CivicConnect</h1>
        <p>We're here to help. Reach out to us with any questions or concerns.</p>
      </header>

      <div className="section-1">
        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="header">
            <h3>Send Us a Message</h3>
            <p className="description">Fill out the form below and we'll get back to you as soon as possible</p>
          </div>

          {/* First row: Name Fields */}
          <div className="name">
            <div className="first-name">
              <label htmlFor="first-name">First Name</label>
              <input id="first-name" {...register("first-name", { required: true })} />
              {errors["first-name"] && <span>This field is required</span>}
            </div>
            <div className="last-name">
              <label htmlFor="last-name">Last Name</label>
              <input id="last-name" {...register("last-name", { required: true })} />
              {errors["last-name"] && <span>This field is required</span>}
            </div>
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register("email", { required: true })} />
            {errors.email && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="subject">Subject</label>
            <input id="subject" {...register("subject", { required: true })} />
            {errors.subject && <span>This field is required</span>}
          </div>

          <div>
            <label htmlFor="message">Message</label>
            <textarea id="message" {...register("message", { required: true })}></textarea>
            {errors.message && <span>This field is required</span>}
          </div>
          <button className="submit-button" type="submit">Send</button>
        </form>

        <div className="contact-info">
          <div className="header">
            <h3>Get In Touch</h3>
            <p className="description">Other ways to reach us</p>
          </div>
          
          <div className="info-items">
            <div className="info-item">
              <FiMail />
              <h4>Email</h4>
            </div>
            <div className="info-item">
              <FiPhoneCall />
              <h4>Phone</h4>
            </div>
            <div className="info-item">
              <FiMapPin />
              <h4>Address</h4>
            </div>
            <div className="info-item">
              <FiClock />
              <h4>Business Hours</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="section-2">
        <div className="header">
          <h3>Frequently Asked Questions</h3>
          <p className="description">Quick answers to common questions</p>
        </div>
      </div>
    </div>
  );
}
export default ContactUs;