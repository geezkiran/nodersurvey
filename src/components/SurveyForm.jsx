'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import styles from './survey-form.module.css';
import { supabase } from '@/utils/supabase';

const AGE_GROUPS = ['2000s', '1990s', '1980s or before'];
const PROFESSIONS = ['Startups or Business', 'Corporate', 'Other', 'To be hired'];
const ROLES = ['Developer / Engineer', 'Designer / Creative', 'Product / Founder'];
const INTEREST_AREAS = ['AI & Automation', 'Real-time & UX', 'Scale & Database'];
const EXCITED_TO_BUILD = ['AI Agents & LLMs', 'Real-time Interfaces', 'Scalable Cloud Infra'];

export function SurveyForm() {
  const [interests, setInterests] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [countdown, setCountdown] = useState(7);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const [email, setEmail] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [profession, setProfession] = useState('');
  const [interestArea, setInterestArea] = useState('');
  const surveyRef = useRef(null);

  const [coordinate, setCoordinate] = useState(null);

  useEffect(() => {
    if (interestArea && interestArea.startsWith('(')) {
      const match = interestArea.match(/\((\d+),\s*(\d+)\)/);
      if (match) {
        setCoordinate({ x: parseInt(match[1]), y: parseInt(match[2]) });
      }
    } else {
      setCoordinate(null);
    }
  }, [interestArea]);

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  useEffect(() => {
    if (!submitted) return;

    if (countdown === 0) {
      window.location.reload();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [submitted, countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setSubmitError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and anon key.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('surveys').insert([
      {
        email,
        age_group: ageGroup,
        profession,
        gender: null,
        interest_area: interestArea || null,
        role: null,
        interests,
        feedback: feedback || null,
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      setSubmitError(error.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleSelectOption = (setValue, val) => {
    setValue(val);
    setDirection(1);
    setTimeout(() => {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 300);
  };

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGraphClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = (1 - (e.clientY - rect.top) / rect.height) * 100;
    
    // Snap to nearest grid line intersection (multiples of 20)
    const gridStep = 20;
    const snappedX = Math.max(0, Math.min(100, Math.round(x / gridStep) * gridStep));
    const snappedY = Math.max(0, Math.min(100, Math.round(y / gridStep) * gridStep));
    
    setCoordinate({ x: snappedX, y: snappedY });
    setInterestArea(`(${snappedX}, ${snappedY})`);
  };

  const steps = [
    {
      id: 0,
      type: 'email',
      title: 'Help us create what actually matters.',
      subtitle: 'Share your email and help us build better tools for your workflow.',
    },
    {
      id: 1,
      type: 'select',
      field: 'ageGroup',
      question: 'Which decade were you born?',
      options: AGE_GROUPS,
      value: ageGroup,
      setValue: setAgeGroup,
    },
    {
      id: 2,
      type: 'select',
      field: 'profession',
      question: 'Which industry do you work in?',
      options: PROFESSIONS,
      value: profession,
      setValue: setProfession,
    },
    {
      id: 3,
      type: 'banner',
    },
    {
      id: 4,
      type: 'graph',
      field: 'interestArea',
      question: 'Scale yourself on this graph',
      xAxisLabel: 'Effort',
      yAxisLabel: 'Impact',
      value: interestArea,
      setValue: setInterestArea,
    },
    {
      id: 5,
      type: 'select',
      field: 'interests',
      question: 'What are you most excited to build?',
      options: EXCITED_TO_BUILD,
      value: interests[0] || '',
      setValue: (val) => setInterests([val]),
    },
    {
      id: 6,
      type: 'feedback',
      question: 'Any additional thoughts?',
      subtitle: 'We value your honest feedback (optional)',
    }
  ];

  const totalSteps = steps.length;
  const currentStepData = steps[step];

  if (submitted) {
    return (
      <div className={styles.surveyContainer}>
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>🥳</div>
          <h2 className={styles.successTitle}>Thank you!</h2>
          <p className={styles.surveyDescription}>
            Your feedback helps us make a huge difference.
          </p>
          <p className={styles.surveyDescriptionend}>
            Redirecting in <span>{countdown}</span> seconds...
          </p>
        </div>
      </div>
    );
  }

  // Animation variants
  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  const optionVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.015,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      transition: { type: 'spring', stiffness: 400, damping: 15 }
    },
    tap: {
      scale: 0.985,
      transition: { type: 'spring', stiffness: 400, damping: 10 }
    },
  };

  const getMarkerColorClasses = () => {
    if (!coordinate) return { dot: '', ripple: '' };
    const diff = coordinate.y - coordinate.x;
    if (Math.abs(diff) === 0) {
      return { dot: styles.dotYellow, ripple: styles.rippleYellow };
    } else if (diff > 0) {
      return { dot: styles.dotGreen, ripple: styles.rippleGreen };
    } else {
      return { dot: styles.dotRed, ripple: styles.rippleRed };
    }
  };
  const markerColors = getMarkerColorClasses();

  return (
    <div ref={surveyRef} className={styles.surveyContainer}>
      {/* Sleek top progress bar */}
      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <div className={styles.stepCardContainer}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={styles.stepCard}
          >
            {currentStepData.type === 'email' && (
              <div className={styles.welcomeSection}>
                <h1 className={styles.surveyTitle}>
                  {currentStepData.title}
                </h1>
                <p className={styles.surveyTagline}>
                  {currentStepData.subtitle}
                </p>
                <div className={styles.floatingInputGroup}>
                  <input
                    id="email"
                    type="email"
                    className={`${styles.textArea} ${styles.floatingInputField}`}
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="email" className={styles.floatingInputLabel}>
                    Email Address
                  </label>
                </div>
                <button
                  type="button"
                  className={`${styles.navButton} ${isValidEmail(email) ? styles.startButton : ''}`}
                  onClick={handleNext}
                  disabled={!isValidEmail(email)}
                >
                  Start
                </button>
              </div>
            )}

            {currentStepData.type === 'select' && (
              <div className={styles.questionSection}>
                <h2 className={styles.questionTitle}>{currentStepData.question}</h2>
                <div className={styles.verticalOptionsList}>
                  {currentStepData.options.map((option) => {
                    const isSelected = currentStepData.value === option;
                    return (
                      <motion.button
                        key={option}
                        type="button"
                        variants={optionVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className={`${styles.optionButton} ${isSelected ? styles.optionSelected : ''}`}
                        onClick={() => handleSelectOption(currentStepData.setValue, option)}
                      >
                        <span className={`${styles.selectionDot} ${isSelected ? styles.dotSelected : ''}`} />
                        <span className={styles.optionText}>{option}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <div className={styles.questionFooter}>
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className={styles.textBackButton}
                    >

                      <span>Back</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {currentStepData.type === 'graph' && (
              <div className={styles.questionSection}>
                <h2 className={styles.questionTitle}>{currentStepData.question}</h2>
                
                <div className={styles.graphContainer}>
                  <div className={styles.yAxisLabelText}>{currentStepData.yAxisLabel}</div>
                  
                  <div className={styles.graphWrapper}>
                    <div className={styles.yAxisTicks}>
                      <span>100</span>
                      <span>50</span>
                      <span>0</span>
                    </div>
                    
                    <div 
                      className={styles.graphGrid} 
                      onClick={handleGraphClick}
                    >
                      <div className={styles.gridLinesContainer}>
                        {[...Array(4)].map((_, i) => (
                          <div key={`v-${i}`} className={styles.verticalGridLine} style={{ left: `${(i + 1) * 20}%` }} />
                        ))}
                        {[...Array(4)].map((_, i) => (
                          <div key={`h-${i}`} className={styles.horizontalGridLine} style={{ bottom: `${(i + 1) * 20}%` }} />
                        ))}
                      </div>

                      <div className={styles.diagonalLine} />

                      <div className={styles.yAxisLine}>
                        <div className={styles.yAxisArrow} />
                      </div>
                      <div className={styles.xAxisLine}>
                        <div className={styles.xAxisArrow} />
                      </div>

                      {coordinate && (
                        <motion.div
                          className={styles.graphMarker}
                          initial={{ scale: 0, left: `${coordinate.x}%`, bottom: `${coordinate.y}%`, x: '-50%', y: '50%' }}
                          animate={{ scale: 1, left: `${coordinate.x}%`, bottom: `${coordinate.y}%`, x: '-50%', y: '50%' }}
                          transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 16,
                            mass: 0.6
                          }}
                        >
                          <div className={`${styles.markerRipple} ${markerColors.ripple}`} />
                          <div className={`${styles.markerDot} ${markerColors.dot}`} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.xAxisRow}>
                    <div className={styles.xAxisTicks}>
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                    <div className={styles.xAxisLabelText}>{currentStepData.xAxisLabel}</div>
                  </div>
                </div>

                {coordinate && (
                  <div className={styles.coordinateDisplay}>
                    Selected Position: <span className={styles.coordValue}>X: {coordinate.x}, Y: {coordinate.y}</span>
                  </div>
                )}

                <div className={styles.questionFooter}>
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className={styles.textBackButton}
                    >
                      <span>Back</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.navButton}
                    onClick={handleNext}
                    disabled={!coordinate}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {currentStepData.type === 'banner' && (
              <div className={styles.duoBannerSection}>
                <div className={styles.duoMascotContainer}>
                  <motion.div
                    className={styles.duoMascot}
                    animate={{
                      y: [0, -12, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  >
                    🦉
                  </motion.div>
                  <div className={styles.duoSpeechBubble}>
                    <p>That's all about yourself! Now let's get to the questions.</p>
                  </div>
                </div>
                <div className={`${styles.questionFooter} ${styles.justifyEnd}`}>
                  <button
                    type="button"
                    className={styles.navButton}
                    onClick={handleNext}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {currentStepData.type === 'feedback' && (
              <form onSubmit={handleSubmit} className={styles.feedbackSection}>
                <h2 className={styles.questionTitle}>{currentStepData.question}</h2>
                <p className={styles.stepSubtitle}>{currentStepData.subtitle}</p>
                <textarea
                  className={styles.textArea}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think..."
                />

                {submitError && (
                  <p className={styles.errorText}>{submitError}</p>
                )}

                <div className={styles.questionFooter}>
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className={styles.textBackButton}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}