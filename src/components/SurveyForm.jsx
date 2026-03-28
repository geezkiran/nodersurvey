'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './survey-form.module.css';
import { supabase } from '@/utils/supabase';

const ROLES = ['Developer', 'Designer', 'Product Manager', 'Founder', 'Student', 'Other'];
const INTERESTS = ['AI Agents', 'Real-time Apps', 'Deployment', 'Database', 'Auth', 'Scalability'];
const INTEREST_AREAS = ['AI', 'Realtime', 'Database', 'Auth', 'Deployment', 'Product'];
const AGE_GROUPS = ['<18', '18-22', '23-27', '28-34', '35-46', '47+'];
const PROFESSIONS = ['Corporate', 'Government', 'Startup', 'Student', 'Freelance', 'Other'];
const GENDERS = ['Female', 'Male', 'Other'];

export function SurveyForm() {
  const [role, setRole] = useState('');
  const [interests, setInterests] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  const [email, setEmail] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [profession, setProfession] = useState('');
  const [gender, setGender] = useState('');
  const [interestArea, setInterestArea] = useState('');
  const surveyRef = useRef(null);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  useEffect(() => {
    if (step === 2 && surveyRef.current) {
      surveyRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('surveys').insert([
      {
        email,
        age_group: ageGroup,
        profession,
        gender,
        interest_area: interestArea || null,
        role,
        interests,
        feedback: feedback || null,
      },
    ]);

    if (error) {
      console.error(error);
      setSubmitError('Something went wrong. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };


  if (submitted) {
    return (
      <div className={styles.surveyContainer}>
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✨</div>
          <h2 className={styles.surveyTitle}>Thank you!</h2>
          <p className={styles.surveyDescription}>
            Your feedback helps us make a huge difference.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={surveyRef} className={styles.surveyContainer}>

      <div className={styles.stepCard}>
        <header className={styles.stepCardHeader}>
          <div className={styles.stepIndicator}>Step 1 of {totalSteps}</div>
          <h1 className={styles.surveyTitle}>
            Help us create something that{' '}
            <span className={styles.matters}>matters.</span>
          </h1>
          <p className={styles.surveyTagline}>
            Share a few quick answers and help us build better tools for your workflow.
          </p>
          <input
            type="email"
            className={styles.textArea}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {step === 0 && (
            <button
              type="button"
              className={`${styles.navButton} ${isValidEmail(email) ? styles.startButton : ''}`}
              onClick={() => setStep(1)}
              disabled={!isValidEmail(email)}
            >
              Start
            </button>
          )}
        </header>
      </div>

      <div className={`${styles.stepCard} ${styles.stepTwoCard} ${step !== 1 ? styles.hiddenSection : ''}`}>
        <form className={styles.stepCardContent} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.stepIndicator}>Step 2 of {totalSteps}</div>
          <h2 className={styles.stepTitle}>Tell us a bit about yourself</h2>

          <section className={styles.formSection}>
            <label className={styles.sectionLabel}>Age</label>
            <div className={`${styles.optionsList} ${styles.optionsGrid}`}>
              {AGE_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  className={`${styles.optionButton} ${ageGroup === group ? styles.optionSelected : ''}`}
                  onClick={() => setAgeGroup(group)}
                >
                  <span className={`${styles.selectionDot} ${ageGroup === group ? styles.dotSelected : ''}`} />
                  {group}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.formSection}>
            <label className={styles.sectionLabel}>Profession</label>
            <div className={`${styles.optionsList} ${styles.optionsGrid}`}>
              {PROFESSIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.optionButton} ${profession === option ? styles.optionSelected : ''}`}
                  onClick={() => setProfession(option)}
                >
                  <span className={`${styles.selectionDot} ${profession === option ? styles.dotSelected : ''}`} />
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.formSection}>
            <label className={styles.sectionLabel}>Gender</label>
            <div className={styles.optionsList}>
              {GENDERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.optionButton} ${gender === option ? styles.optionSelected : ''}`}
                  onClick={() => setGender(option)}
                >
                  <span className={`${styles.selectionDot} ${gender === option ? styles.dotSelected : ''}`} />
                  {option}
                </button>
              ))}
            </div>
          </section>

          

          <div className={styles.actionRow}>
            <button type="button" onClick={() => setStep(2)} className={styles.navButton}>
              Next
            </button>
          </div>
        </form>
      </div>

      <div className={`${styles.stepCard} ${step < 2 ? styles.hiddenSection : ''}`}>
        <form className={styles.stepCardContent} onSubmit={handleSubmit}>
          <div className={styles.stepIndicator}>Step 3 of {totalSteps}</div>
          
          <h2 className={styles.stepTitle}>Tell us what matters most</h2>

          <section className={styles.formSection}>
            <label className={styles.sectionLabel}>
              Q1. How would you describe yourself?
            </label>
            <div className={styles.optionsList}>
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.optionButton} ${role === r ? styles.optionSelected : ''}`}
                  onClick={() => setRole(r)}
                >
                  <span className={`${styles.selectionDot} ${role === r ? styles.dotSelected : ''}`} />
                  {r}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.formSection}>
            <label className={styles.sectionLabel}>
              Q2. What are you most excited to build?
            </label>
            <div className={styles.optionsList}>
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.optionButton} ${interests.includes(i) ? styles.optionSelected : ''}`}
                  onClick={() => toggleInterest(i)}
                >
                  <span className={`${styles.selectionDot} ${interests.includes(i) ? styles.dotSelected : ''}`} />
                  {i}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.formSection}>
            <label className={styles.sectionLabel}>
              Q3. What area are you most interested in?
            </label>
            <div className={styles.optionsList}>
              {INTEREST_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  className={`${styles.optionButton} ${interestArea === area ? styles.optionSelected : ''}`}
                  onClick={() => setInterestArea(area)}
                >
                  <span className={`${styles.selectionDot} ${interestArea === area ? styles.dotSelected : ''}`} />
                  {area}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.formSection}>
            <label className={styles.sectionLabel}>
              Q4. Additional thoughts? (Optional)
            </label>
            <textarea
              className={styles.textArea}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </section>

          {submitError && (
            <p className={styles.errorText}>{submitError}</p>
          )}

          <div className={styles.actionRow}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!role || interests.length === 0 || !interestArea || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}