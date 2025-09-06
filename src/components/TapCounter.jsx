import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RotateCcw, Target, Zap, Trophy } from 'lucide-react';

const TapCounter = () => {
  const [count, setCount] = useState(0);
  const [targetLimit, setTargetLimit] = useState(10);
  const [inputLimit, setInputLimit] = useState('10');
  const [isActive, setIsActive] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [tapAnimation, setTapAnimation] = useState(false);
  const audioRef = useRef(null);

  // 🔒 Lock body scroll while this component is mounted
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  // Create audio context for sound feedback
  useEffect(() => {
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    audioRef.current = createBeepSound;
  }, []);

  const handleTap = () => {
    if (!isActive || hasReachedLimit) return;

    const newCount = count + 1;
    setCount(newCount);

    // Trigger tap animation
    setTapAnimation(true);
    setTimeout(() => setTapAnimation(false), 180);

    // Check if target is reached
    if (newCount >= targetLimit) {
      setHasReachedLimit(true);

      // Trigger vibration if supported
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      // Play sound
      if (audioRef.current) {
        try {
          audioRef.current();
        } catch (error) {
          console.log('Could not play sound:', error);
        }
      }
    }
  };

  const handleStart = () => {
    const limit = parseInt(inputLimit);
    if (limit > 0) {
      setTargetLimit(limit);
      setCount(0);
      setIsActive(true);
      setHasReachedLimit(false);
    }
  };

  const handleReset = () => {
    setCount(0);
    setIsActive(false);
    setHasReachedLimit(false);
  };

  const progressPercentage = isActive ? (count / targetLimit) * 100 : 0;
  const remainingTaps = targetLimit - count;

  return (
    <div
      style={{
        position: 'fixed',   // ✅ pin to viewport
        inset: 0,
        height: '100dvh',    // ✅ stable on mobile address bar changes
        width: '100vw',
        overflow: 'hidden',  // ✅ no scrollbars ever
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #faf5ff 100%)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '1rem', // inner spacing that won't affect viewport height
          boxSizing: 'border-box',
        }}
      >
        <Card
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            overflow: 'clip', // clip any internal overflows from effects
            contain: 'layout paint style', // prevent layout shifts from escaping
          }}
        >
          {/* Header */}
          <CardHeader
            style={{
              textAlign: 'center',
              padding: '16px 16px 12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white',
            }}
          >
            <CardTitle
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                marginBottom: 4,
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
              }}
            >
              ⚡ Tap Counter
            </CardTitle>
            <p
              style={{
                color: '#dbeafe',
                fontSize: '1rem',
                fontWeight: 500,
                margin: 0,
              }}
            >
              {isActive ? `${remainingTaps} taps to go!` : 'Set your goal and start tapping!'}
            </p>
          </CardHeader>

          <CardContent
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Counter Display */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    fontSize: '4rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 8,
                    transition: 'transform 0.18s ease',
                    transform: tapAnimation ? 'scale(1.06)' : 'scale(1)',
                    willChange: 'transform',
                  }}
                >
                  {count}
                </div>

                {isActive && (
                  <div
                    style={{
                      fontSize: '1rem',
                      color: '#6b7280',
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    of {targetLimit} taps
                  </div>
                )}

                {isActive && (
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '100%',
                        backgroundColor: '#e5e7eb',
                        borderRadius: 9999,
                        height: 12,
                      }}
                    >
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          height: 12,
                          borderRadius: 9999,
                          transition: 'width 0.4s ease-out',
                          width: `${Math.min(progressPercentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginTop: 8,
                        fontWeight: 500,
                      }}
                    >
                      {Math.round(progressPercentage)}% Complete
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Section */}
            {!isActive && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Target style={{ width: 20, height: 20, color: '#2563eb' }} />
                  <label style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>
                    Set Your Challenge
                  </label>
                </div>
                <Input
                  type="number"
                  value={inputLimit}
                  onChange={(e) => setInputLimit(e.target.value)}
                  placeholder="Enter target"
                  min="1"
                  max="1000"
                  style={{
                    textAlign: 'center',
                    fontSize: 20,
                    padding: 12,
                    border: '2px solid #bfdbfe',
                    borderRadius: 12,
                    fontWeight: 700,
                  }}
                />
                <Button
                  onClick={handleStart}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    color: 'white',
                    padding: 12,
                    fontSize: 18,
                    fontWeight: 700,
                    borderRadius: 12,
                    transform: 'translateZ(0)',
                  }}
                  disabled={!inputLimit || parseInt(inputLimit) <= 0}
                >
                  <Zap style={{ width: 20, height: 20, marginRight: 8 }} />
                  Start Challenge
                </Button>
              </div>
            )}

            {/* Tap Button */}
            {isActive && !hasReachedLimit && (
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Button
                  onClick={handleTap}
                  style={{
                    width: 'min(80vw, 20rem)',   // ✅ big but never causes overflow
                    height: 'min(80vw, 20rem)',
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #4f46e5 100%)',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 900,
                    border: '6px solid rgba(255,255,255,0.7)',
                    boxShadow: '0 20px 60px rgba(79,70,229,0.35)',
                    transition: 'transform 0.1s ease',
                    transform: tapAnimation ? 'scale(0.98)' : 'scale(1)', // only shrink on press
                    willChange: 'transform',
                    contain: 'paint',
                  }}
                >
                  <div style={{ display: 'grid', placeItems: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>👆</div>
                    <div>TAP ME</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, opacity: 0.9 }}>
                      {remainingTaps} left
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {/* Success Message */}
            {hasReachedLimit && (
              <div
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: '4px 0',
                }}
              >
                <div style={{ fontSize: 48 }}>🎉</div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Well Done!
                </div>
                <div style={{ fontSize: 18, color: '#374151', fontWeight: 600 }}>
                  You reached your goal of {targetLimit} taps.
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    color: '#d97706',
                    fontWeight: 700,
                  }}
                >
                  <Trophy style={{ width: 20, height: 20 }} />
                  Goal Completed
                  <Trophy style={{ width: 20, height: 20 }} />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              {(isActive || hasReachedLimit) && (
                <Button
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    background: hasReachedLimit
                      ? 'linear-gradient(135deg, #059669 0%, #2563eb 100%)'
                      : '#fff',
                    color: hasReachedLimit ? 'white' : '#374151',
                    border: hasReachedLimit ? 'none' : '2px solid #d1d5db',
                    padding: 12,
                    borderRadius: 12,
                    fontWeight: 600,
                  }}
                >
                  <RotateCcw style={{ width: 16, height: 16, marginRight: 8 }} />
                  {hasReachedLimit ? 'New Challenge' : 'Reset'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TapCounter;
