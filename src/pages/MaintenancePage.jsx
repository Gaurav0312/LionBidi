// pages/MaintenancePage.jsx
import React, { useEffect, useState } from 'react';

const MaintenancePage = ({ message, estimatedEndTime, onCheckAgain }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [dots, setDots] = useState('');

  // Animated dots for "working on it..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!estimatedEndTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(estimatedEndTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Any moment now!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [estimatedEndTime]);

  // Auto-check every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (onCheckAgain) onCheckAgain();
    }, 30000);
    return () => clearInterval(interval);
  }, [onCheckAgain]);

  return (
    <div style={styles.wrapper}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.container}>
        {/* Animated gear icon */}
        <div style={styles.iconContainer}>
          <svg
            style={styles.gear}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={styles.title}>Under Maintenance</h1>

        {/* Message */}
        <p style={styles.message}>
          {message || "We're currently performing scheduled maintenance. We'll be back shortly!"}
        </p>

        {/* Countdown */}
        {estimatedEndTime && (
          <div style={styles.countdownWrapper}>
            <p style={styles.countdownLabel}>Estimated time remaining</p>
            <p style={styles.countdown}>{timeLeft}</p>
          </div>
        )}

        {/* Progress bar */}
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>

        <p style={styles.workingText}>
          Our team is working on it{dots}
        </p>

        {/* Refresh button */}
        <button
          onClick={onCheckAgain}
          style={styles.refreshButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.25)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.15)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Check Again
        </button>

        <p style={styles.autoRefresh}>
          This page auto-refreshes every 30 seconds
        </p>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes maintenance-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes maintenance-float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes maintenance-float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.15); }
          66% { transform: translate(25px, -40px) scale(0.85); }
        }
        @keyframes maintenance-float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 30px) scale(1.1); }
        }
        @keyframes maintenance-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        @keyframes maintenance-fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes maintenance-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #312e81 60%, #1e1b4b 100%)',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  orb1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
    top: '-10%',
    right: '-5%',
    animation: 'maintenance-float1 8s ease-in-out infinite',
  },
  orb2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
    bottom: '-5%',
    left: '-5%',
    animation: 'maintenance-float2 10s ease-in-out infinite',
  },
  orb3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
    top: '40%',
    left: '60%',
    animation: 'maintenance-float3 6s ease-in-out infinite',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '48px 40px',
    maxWidth: 520,
    width: '90%',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 24,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
    animation: 'maintenance-fadeIn 0.8s ease-out',
  },
  iconContainer: {
    width: 80,
    height: 80,
    margin: '0 auto 24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'maintenance-pulse 2s ease-in-out infinite',
  },
  gear: {
    width: 40,
    height: 40,
    color: '#1e293b',
    animation: 'maintenance-spin 4s linear infinite',
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#ffffff',
    margin: '0 0 12px',
    letterSpacing: '-0.02em',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.6,
    margin: '0 0 28px',
  },
  countdownWrapper: {
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    borderRadius: 16,
    padding: '16px 24px',
    marginBottom: 28,
  },
  countdownLabel: {
    fontSize: 12,
    color: 'rgba(251, 191, 36, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 600,
    margin: '0 0 6px',
  },
  countdown: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fbbf24',
    margin: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
    background: 'linear-gradient(90deg, #6366f1, #a855f7, #fbbf24)',
    animation: 'maintenance-progress 2s ease-in-out infinite',
  },
  workingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    margin: '0 0 24px',
    minHeight: 20,
  },
  refreshButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 32px',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: 16,
    letterSpacing: '0.02em',
  },
  autoRefresh: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.35)',
    margin: 0,
  },
};

export default MaintenancePage;
