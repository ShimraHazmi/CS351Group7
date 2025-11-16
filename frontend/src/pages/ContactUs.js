import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhoneCall, FiMapPin, FiClock } from 'react-icons/fi';
import '../css/contactus.css';

function ContactUs() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error', or 'cooldown'
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      console.log('Submitting form data:', data);
      
      // Send data to backend API
      const response = await fetch('http://localhost:8000/api/contact/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: data['first-name'],
          last_name: data['last-name'],
          email: data.email,
          subject: data.subject,
          message: data.message
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle different error statuses
        if (response.status === 429) {
          // Cooldown active
          setSubmitStatus('cooldown');
          setErrorMessage(result.error || 'Please wait before submitting again');
        } else if (response.status === 400) {
          // Validation error
          setSubmitStatus('error');
          setErrorMessage(result.error || 'Please fill out all required fields');
        } else {
          // Other errors
          setSubmitStatus('error');
          setErrorMessage(result.error || 'Failed to send message. Please try again.');
        }
        
        // Auto-hide error messages after 8 seconds
        setTimeout(() => {
          setSubmitStatus(null);
          setErrorMessage('');
        }, 8000);
        
        return;
      }
      
      console.log('Message sent successfully:', result);
      
      // Clear the form
      reset();
      
      // Show success message
      setSubmitStatus('success');
      
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error.');
      

      setTimeout(() => {
        setSubmitStatus(null);
        setErrorMessage('');
      }, 8000);
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '12px 20px',
              borderRadius: '5px',
              marginBottom: '20px',
              border: '1px solid #c3e6cb',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>✓</span>
              <span><strong>Success!</strong> Your message has been sent. We'll get back to you soon.</span>
            </div>
          )}

          {submitStatus === 'cooldown' && (
            <div style={{
              backgroundColor: '#fff3cd',
              color: '#856404',
              padding: '12px 20px',
              borderRadius: '5px',
              marginBottom: '20px',
              border: '1px solid #ffeaa7',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>⏱</span>
              <span><strong>Please wait!</strong> {errorMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px 20px',
              borderRadius: '5px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>✗</span>
              <span><strong>Error!</strong> {errorMessage || 'Something went wrong. Please try again later.'}</span>
            </div>
          )}

          {/* First row: Name Fields */}
          <div className="name">
            <div className="first-name">
              <label htmlFor="first-name">First Name</label>
              <input 
                id="first-name" 
                {...register("first-name", { required: true })} 
                disabled={isSubmitting}
              />
              {errors["first-name"] && <span className="error-text">This field is required</span>}
            </div>
            <div className="last-name">
              <label htmlFor="last-name">Last Name</label>
              <input 
                id="last-name" 
                {...register("last-name", { required: true })} 
                disabled={isSubmitting}
              />
              {errors["last-name"] && <span className="error-text">This field is required</span>}
            </div>
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              {...register("email", { required: true })} 
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-text">This field is required</span>}
          </div>

          <div>
            <label htmlFor="subject">Subject</label>
            <input 
              id="subject" 
              {...register("subject", { required: true })} 
              disabled={isSubmitting}
            />
            {errors.subject && <span className="error-text">This field is required</span>}
          </div>

          <div>
            <label htmlFor="message">Message</label>
            <textarea 
              id="message" 
              {...register("message", { required: true })}
              disabled={isSubmitting}
            ></textarea>
            {errors.message && <span className="error-text">This field is required</span>}
          </div>
          
          <button 
            className="submit-button" 
            type="submit"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
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